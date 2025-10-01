import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                    {title}
                </CardTitle>
                {icon && (
                    <div className="text-gray-400">
                        {icon}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                    {value}
                </div>
                {description && (
                    <p className="text-xs text-gray-600">
                        {description}
                    </p>
                )}
                {trend && (
                    <div className="flex items-center text-xs mt-2">
            <span className={`font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
                        <span className="text-gray-600 ml-1">from last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}