import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { KPIDefinition } from '@/api/entities';
import { Plus, Edit, Trash2, BarChart3, ArrowLeft, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

const initialKPIState = {
    kpi_name: '',
    kpi_id: '',
    description: '',
    category: 'sales',
    data_source: 'leads',
    calculation_method: 'count',
    formula: '',
    target_value: 100,
    unit: '',
    format: 'number',
    time_period: 'monthly',
    is_active: true,
    display_order: 0,
    icon: 'BarChart3',
    color: '#3B82F6'
};

export default function KPIManagement() {
    const [kpis, setKpis] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentKPI, setCurrentKPI] = useState(initialKPIState);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchKPIs();
    }, []);

    const fetchKPIs = async () => {
        setIsLoading(true);
        try {
            const data = await KPIDefinition.list('display_order');
            setKpis(data);
        } catch (error) {
            console.error("Failed to load KPIs:", error);
            toast.error("Failed to load KPIs");
        }
        setIsLoading(false);
    };

    const handleOpenDialog = (kpi = null) => {
        if (kpi) {
            setCurrentKPI(kpi);
            setIsEditing(true);
        } else {
            setCurrentKPI(initialKPIState);
            setIsEditing(false);
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            // Generate ID from name if not provided
            if (!currentKPI.kpi_id) {
                const id = currentKPI.kpi_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                setCurrentKPI({...currentKPI, kpi_id: id});
            }

            if (isEditing) {
                await KPIDefinition.update(currentKPI.id, currentKPI);
                toast.success("KPI updated successfully!");
            } else {
                await KPIDefinition.create(currentKPI);
                toast.success("KPI created successfully!");
            }
            fetchKPIs();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error(`Failed to ${isEditing ? 'update' : 'create'} KPI.`);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this KPI?")) {
            try {
                await KPIDefinition.delete(id);
                toast.success("KPI deleted successfully!");
                fetchKPIs();
            } catch (error) {
                toast.error("Failed to delete KPI.");
            }
        }
    };

    const handleToggleActive = async (kpi) => {
        try {
            await KPIDefinition.update(kpi.id, { ...kpi, is_active: !kpi.is_active });
            toast.success(`KPI ${kpi.is_active ? 'disabled' : 'enabled'} successfully!`);
            fetchKPIs();
        } catch (error) {
            toast.error("Failed to update KPI status.");
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            sales: 'bg-green-100 text-green-800',
            activity: 'bg-blue-100 text-blue-800',
            quality: 'bg-purple-100 text-purple-800',
            efficiency: 'bg-orange-100 text-orange-800',
            custom: 'bg-gray-100 text-gray-800'
        };
        return colors[category] || colors.custom;
    };

    return (
        <div className="p-8">
            <Link to={createPageUrl('KPIDashboard')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to KPI Dashboard
            </Link>
            
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">KPI Management</h1>
                    <p className="text-muted-foreground">Define and manage key performance indicators for your team.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create KPI
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Configured KPIs</CardTitle>
                    <CardDescription>Manage the KPIs that appear on your dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading KPIs...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>KPI Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Data Source</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kpis.map((kpi) => (
                                    <TableRow key={kpi.id}>
                                        <TableCell className="font-medium">{kpi.kpi_name}</TableCell>
                                        <TableCell>
                                            <Badge className={getCategoryColor(kpi.category)}>
                                                {kpi.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{kpi.data_source}</TableCell>
                                        <TableCell>
                                            {kpi.format === 'currency' ? `$${kpi.target_value.toLocaleString()}` : 
                                             kpi.format === 'percentage' ? `${kpi.target_value}%` : 
                                             `${kpi.target_value} ${kpi.unit || ''}`}
                                        </TableCell>
                                        <TableCell>{kpi.time_period}</TableCell>
                                        <TableCell>
                                            <Switch 
                                                checked={kpi.is_active} 
                                                onCheckedChange={() => handleToggleActive(kpi)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(kpi)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(kpi.id)}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {kpis.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No KPIs configured yet. Click "Create KPI" to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit' : 'Create'} KPI</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="kpi_name">KPI Name *</Label>
                                <Input 
                                    id="kpi_name" 
                                    value={currentKPI.kpi_name} 
                                    onChange={(e) => setCurrentKPI({...currentKPI, kpi_name: e.target.value})}
                                    placeholder="e.g., Monthly Call Volume"
                                />
                            </div>
                            <div>
                                <Label htmlFor="kpi_id">KPI ID *</Label>
                                <Input 
                                    id="kpi_id" 
                                    value={currentKPI.kpi_id} 
                                    onChange={(e) => setCurrentKPI({...currentKPI, kpi_id: e.target.value})}
                                    placeholder="e.g., monthly_calls"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea 
                                id="description" 
                                value={currentKPI.description} 
                                onChange={(e) => setCurrentKPI({...currentKPI, description: e.target.value})}
                                placeholder="Describe what this KPI measures..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select value={currentKPI.category} onValueChange={(value) => setCurrentKPI({...currentKPI, category: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sales">Sales</SelectItem>
                                        <SelectItem value="activity">Activity</SelectItem>
                                        <SelectItem value="quality">Quality</SelectItem>
                                        <SelectItem value="efficiency">Efficiency</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="data_source">Data Source</Label>
                                <Select value={currentKPI.data_source} onValueChange={(value) => setCurrentKPI({...currentKPI, data_source: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="leads">Leads</SelectItem>
                                        <SelectItem value="call_records">Call Records</SelectItem>
                                        <SelectItem value="documents">Documents</SelectItem>
                                        <SelectItem value="sales_rooms">Sales Rooms</SelectItem>
                                        <SelectItem value="custom_formula">Custom Formula</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="calculation_method">Calculation</Label>
                                <Select value={currentKPI.calculation_method} onValueChange={(value) => setCurrentKPI({...currentKPI, calculation_method: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="count">Count</SelectItem>
                                        <SelectItem value="sum">Sum</SelectItem>
                                        <SelectItem value="average">Average</SelectItem>
                                        <SelectItem value="percentage">Percentage</SelectItem>
                                        <SelectItem value="ratio">Ratio</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="target_value">Target Value *</Label>
                                <Input 
                                    id="target_value" 
                                    type="number"
                                    value={currentKPI.target_value} 
                                    onChange={(e) => setCurrentKPI({...currentKPI, target_value: parseInt(e.target.value)})}
                                />
                            </div>
                            <div>
                                <Label htmlFor="time_period">Time Period</Label>
                                <Select value={currentKPI.time_period} onValueChange={(value) => setCurrentKPI({...currentKPI, time_period: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                        <SelectItem value="annual">Annual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="format">Display Format</Label>
                                <Select value={currentKPI.format} onValueChange={(value) => setCurrentKPI({...currentKPI, format: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="number">Number</SelectItem>
                                        <SelectItem value="currency">Currency</SelectItem>
                                        <SelectItem value="percentage">Percentage</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="unit">Unit</Label>
                                <Input 
                                    id="unit" 
                                    value={currentKPI.unit} 
                                    onChange={(e) => setCurrentKPI({...currentKPI, unit: e.target.value})}
                                    placeholder="e.g., calls, deals, %, $"
                                />
                            </div>
                            <div>
                                <Label htmlFor="display_order">Display Order</Label>
                                <Input 
                                    id="display_order" 
                                    type="number"
                                    value={currentKPI.display_order} 
                                    onChange={(e) => setCurrentKPI({...currentKPI, display_order: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>

                        {currentKPI.calculation_method === 'custom' && (
                            <div>
                                <Label htmlFor="formula">Custom Formula</Label>
                                <Textarea 
                                    id="formula" 
                                    value={currentKPI.formula} 
                                    onChange={(e) => setCurrentKPI({...currentKPI, formula: e.target.value})}
                                    placeholder="Enter custom calculation formula..."
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                            {isEditing ? 'Update' : 'Create'} KPI
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}