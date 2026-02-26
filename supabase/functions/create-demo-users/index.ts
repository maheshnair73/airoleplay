import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEMO_USERS = [
  {
    email: "admin@effysalespro.com",
    password: "demo123",
    role: "company_admin",
    full_name: "Admin User",
  },
  {
    email: "manager@effysalespro.com",
    password: "demo123",
    role: "sales_manager",
    full_name: "Manager User",
  },
  {
    email: "agent1@effysalespro.com",
    password: "demo123",
    role: "sales_agent",
    full_name: "Agent 1",
  },
  {
    email: "agent2@effysalespro.com",
    password: "demo123",
    role: "sales_agent",
    full_name: "Agent 2",
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const results = [];

    for (const user of DEMO_USERS) {
      try {
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
        const userExists = existingUser?.users?.some((u) => u.email === user.email);

        if (userExists) {
          results.push({
            email: user.email,
            status: "already_exists",
            message: "User already exists",
          });
          continue;
        }

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            full_name: user.full_name,
            role: user.role,
          },
        });

        if (authError) {
          results.push({
            email: user.email,
            status: "error",
            message: authError.message,
          });
          continue;
        }

        if (authData?.user) {
          const { error: profileError } = await supabaseAdmin
            .from("user_profiles")
            .upsert({
              id: authData.user.id,
              email: user.email,
              role: user.role,
              full_name: user.full_name,
            }, {
              onConflict: "id",
            });

          if (profileError) {
            results.push({
              email: user.email,
              status: "partial",
              message: `User created but profile error: ${profileError.message}`,
            });
          } else {
            results.push({
              email: user.email,
              status: "success",
              message: "User created successfully",
            });
          }
        }
      } catch (error) {
        results.push({
          email: user.email,
          status: "error",
          message: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
