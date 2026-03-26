import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { flow_id, trigger_data } = await req.json();

    if (!flow_id) {
      throw new Error('Flow ID is required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: flow } = await supabase
      .from('integration_flows')
      .select('*, integration_flow_steps(*)')
      .eq('id', flow_id)
      .eq('status', 'active')
      .maybeSingle();

    if (!flow) {
      throw new Error('Flow not found or inactive');
    }

    const executionId = crypto.randomUUID();
    const startTime = Date.now();

    await logExecution(supabase, flow_id, null, executionId, 'info', 'Flow execution started', {
      trigger_data,
    });

    const steps = flow.integration_flow_steps.sort((a: any, b: any) => a.step_order - b.step_order);

    let previousOutput = trigger_data;
    let flowSuccess = true;

    for (const step of steps) {
      try {
        await logExecution(supabase, flow_id, step.id, executionId, 'info', `Executing step: ${step.action_type}`, {
          step_order: step.step_order,
        });

        const stepStartTime = Date.now();

        if (step.conditions && step.conditions.length > 0) {
          const conditionsMet = evaluateConditions(step.conditions, previousOutput);
          if (!conditionsMet) {
            await logExecution(supabase, flow_id, step.id, executionId, 'info', 'Step skipped due to conditions', {
              conditions: step.conditions,
            });
            continue;
          }
        }

        const { data: connectedAccount } = await supabase
          .from('connected_accounts')
          .select('*')
          .eq('id', step.connected_account_id)
          .maybeSingle();

        if (!connectedAccount) {
          throw new Error('Connected account not found');
        }

        const mappedData = applyFieldMapping(previousOutput, step.field_mapping);

        const result = await executeAction(
          step.connector_id,
          step.action_type,
          { ...step.action_config, ...mappedData },
          connectedAccount
        );

        const executionTime = Date.now() - stepStartTime;

        await logExecution(
          supabase,
          flow_id,
          step.id,
          executionId,
          'info',
          'Step completed successfully',
          { input: mappedData, output: result },
          executionTime
        );

        previousOutput = result;

      } catch (stepError) {
        flowSuccess = false;

        await logExecution(
          supabase,
          flow_id,
          step.id,
          executionId,
          'error',
          `Step failed: ${stepError.message}`,
          { error: stepError.message }
        );

        if (step.on_error === 'stop') {
          break;
        } else if (step.on_error === 'retry' && step.retry_count > 0) {
          console.log(`Retrying step ${step.id}`);
        }
      }
    }

    const totalExecutionTime = Date.now() - startTime;

    await supabase
      .from('integration_flows')
      .update({
        execution_count: flow.execution_count + 1,
        success_count: flowSuccess ? flow.success_count + 1 : flow.success_count,
        error_count: flowSuccess ? flow.error_count : flow.error_count + 1,
        last_execution_at: new Date().toISOString(),
      })
      .eq('id', flow_id);

    await logExecution(
      supabase,
      flow_id,
      null,
      executionId,
      flowSuccess ? 'info' : 'error',
      flowSuccess ? 'Flow completed successfully' : 'Flow completed with errors',
      { final_output: previousOutput },
      totalExecutionTime
    );

    return new Response(
      JSON.stringify({
        success: flowSuccess,
        execution_id: executionId,
        result: previousOutput,
        execution_time_ms: totalExecutionTime,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error executing flow:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function executeAction(
  connectorId: string,
  actionType: string,
  params: any,
  connectedAccount: any
) {
  const response = await fetch(`${supabaseUrl}/functions/v1/connector-action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({
      connector_id: connectorId,
      action_type: actionType,
      params,
      credentials: {
        accessToken: connectedAccount.access_token,
        refreshToken: connectedAccount.refresh_token,
        instanceUrl: connectedAccount.instance_url,
        apiKey: connectedAccount.access_token,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Action execution failed: ${error}`);
  }

  return await response.json();
}

function evaluateConditions(conditions: any[], data: any): boolean {
  return conditions.every(condition => {
    const value = getNestedValue(data, condition.field);
    const targetValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return value === targetValue;
      case 'not_equals':
        return value !== targetValue;
      case 'contains':
        return String(value).includes(targetValue);
      case 'greater_than':
        return Number(value) > Number(targetValue);
      case 'less_than':
        return Number(value) < Number(targetValue);
      case 'exists':
        return value !== undefined && value !== null;
      case 'not_exists':
        return value === undefined || value === null;
      default:
        return true;
    }
  });
}

function applyFieldMapping(data: any, mapping: any): any {
  if (!mapping || Object.keys(mapping).length === 0) {
    return data;
  }

  const result: any = {};

  Object.entries(mapping).forEach(([targetField, sourceField]) => {
    const value = getNestedValue(data, sourceField as string);
    if (value !== undefined) {
      setNestedValue(result, targetField, value);
    }
  });

  return result;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

async function logExecution(
  supabase: any,
  flowId: string,
  stepId: string | null,
  executionId: string,
  level: string,
  message: string,
  data?: any,
  executionTime?: number
) {
  await supabase.from('integration_logs').insert({
    flow_id: flowId,
    step_id: stepId,
    execution_id: executionId,
    log_level: level,
    message,
    status: level === 'error' ? 'error' : 'success',
    input_data: data?.input,
    output_data: data?.output,
    error_details: data?.error ? { message: data.error } : null,
    execution_time_ms: executionTime,
  });
}
