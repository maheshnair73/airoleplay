import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export const RoleplaySetupLayout = ({
  children,
  title,
  description,
  icon: Icon,
  backPath = '/ai-roleplay',
  backLabel = 'Back',
  onBack,
  currentTab,
  tabs,
  onTabChange,
  loading = false
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backPath && backPath !== '#') {
      navigate(backPath);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-8 px-2 gap-1"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{backLabel}</span>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {Icon && (
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
                {description && (
                  <p className="text-slate-600 mt-1">{description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {tabs && tabs.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg border border-slate-200 p-1 flex gap-1 flex-wrap">
              {tabs.map((tab, index) => {
                const isActive = currentTab === tab.id;
                const isComplete = tab.complete;
                const isAccessible = tab.accessible !== false;

                return (
                  <button
                    key={tab.id}
                    onClick={() => isAccessible && onTabChange(tab.id)}
                    disabled={!isAccessible}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : isComplete
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : isAccessible
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {tab.icon && (
                      <tab.icon className="w-4 h-4" />
                    )}
                    <span>{tab.label}</span>
                    {isComplete && (
                      <span className="ml-1 text-xs font-bold">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-0">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const RoleplaySetupSection = ({
  title,
  description,
  children,
  highlight = false
}) => (
  <div className={`p-6 border-b last:border-b-0 ${
    highlight
      ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
      : 'bg-white border-slate-200'
  }`}>
    {title && (
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        )}
      </div>
    )}
    {children}
  </div>
);

export const RoleplaySetupField = ({
  label,
  description,
  children,
  required = false
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-1">
      <label className="text-sm font-medium text-slate-900">{label}</label>
      {required && (
        <span className="text-red-500">*</span>
      )}
    </div>
    {description && (
      <p className="text-xs text-slate-600">{description}</p>
    )}
    {children}
  </div>
);

export const RoleplaySetupGrid = ({
  columns = 2,
  children
}) => (
  <div className={`grid grid-cols-1 gap-6 ${
    columns === 2 ? 'sm:grid-cols-2' : ''
  }`}>
    {children}
  </div>
);

export const RoleplaySetupActions = ({
  onBack,
  onNext,
  onStart,
  backDisabled = false,
  nextDisabled = false,
  startDisabled = false,
  isLoading = false,
  step = 'middle'
}) => (
  <div className="px-6 py-6 bg-slate-50 border-t border-slate-200 flex gap-3 justify-between">
    <Button
      variant="outline"
      onClick={onBack}
      disabled={backDisabled || isLoading}
      className="min-w-28"
    >
      Previous
    </Button>

    <div className="flex gap-3 flex-1 justify-end">
      {onNext && step !== 'final' && (
        <Button
          onClick={onNext}
          disabled={nextDisabled || isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Continue
        </Button>
      )}
      {onStart && step === 'final' && (
        <Button
          onClick={onStart}
          disabled={startDisabled || isLoading}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg text-white"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Starting...
            </>
          ) : (
            'Start Session'
          )}
        </Button>
      )}
    </div>
  </div>
);

export const InfoBanner = ({
  children,
  type = 'info'
}) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
  };

  return (
    <div className={`p-4 border rounded-lg text-sm ${styles[type]}`}>
      {children}
    </div>
  );
};
