import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

export default function AnalyticsView({ room }) {
    const participants = room.participants || [];
    const engagementData = room.analytics?.content_engagement || [];

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate-800">Engagement Analytics</h2>
            
            <Card>
                <CardHeader>
                    <CardTitle>Participant Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Participant</TableHead>
                                <TableHead>Visits</TableHead>
                                <TableHead>Time in Content</TableHead>
                                <TableHead>Last Visit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {participants.map((p, index) => (
                                <TableRow key={index} className="hover:bg-slate-50">
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar className="w-9 h-9">
                                            <AvatarImage src={p.avatar_url} />
                                            <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-slate-800">{p.name}</p>
                                            <p className="text-sm text-slate-500">{p.title || p.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{p.visit_count} visits</TableCell>
                                    <TableCell className="font-medium">{Math.round((p.total_time_spent || 0) / 60)} minutes</TableCell>
                                    <TableCell>{p.last_seen ? formatDistanceToNow(new Date(p.last_seen), { addSuffix: true }) : 'Never'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Content Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={engagementData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="section_title" tick={{fontSize: 12}} />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{fontSize: 12}} label={{ value: 'Time (min)', angle: -90, position: 'insideLeft', offset: 10, style: {fontSize: 12} }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{fontSize: 12}} label={{ value: 'Views', angle: 90, position: 'insideRight', offset: 10, style: {fontSize: 12} }} />
                            <Tooltip />
                            <Legend wrapperStyle={{fontSize: 14}} />
                            <Bar yAxisId="left" dataKey="time_spent" fill="#8884d8" name="Time Spent (min)" barSize={30} />
                            <Bar yAxisId="right" dataKey="views" fill="#82ca9d" name="Total Views" barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}