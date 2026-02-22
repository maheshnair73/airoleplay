import React from 'react';
import SSOModuleLoader from '@/components/integration/SSOModuleLoader';

export default function IntegratedModules() {
    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Integrated Modules</h1>
                <p className="text-slate-600 mt-2">Access modules from other applications with seamless SSO</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Example: Another Base44 app module */}
                <SSOModuleLoader
                    targetAppUrl="https://preview--other-app.base44.app"
                    modulePath="/dashboard"
                    title="Analytics Dashboard"
                    height="500px"
                />

                {/* Example: CRM module */}
                <SSOModuleLoader
                    targetAppUrl="https://preview--crm-app.base44.app"
                    modulePath="/contacts"
                    title="CRM Contacts"
                    height="500px"
                />
            </div>
        </div>
    );
}