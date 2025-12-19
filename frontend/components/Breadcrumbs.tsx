import React from 'react';
import { ChevronRightIcon, HomeIcon } from './icons';

export interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
    active?: boolean;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-2">
                <li>
                    <div>
                        <span className="text-slate-400 hover:text-slate-500">
                            <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                            <span className="sr-only">Home</span>
                        </span>
                    </div>
                </li>
                {items.map((item, index) => (
                    <li key={item.label}>
                        <div className="flex items-center">
                            <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-slate-300" aria-hidden="true" />
                            <button
                                onClick={item.onClick}
                                disabled={item.active}
                                className={`ml-2 text-sm font-medium ${item.active
                                        ? 'text-slate-900 cursor-default'
                                        : 'text-slate-500 hover:text-primary-600 transition-colors'
                                    }`}
                                aria-current={item.active ? 'page' : undefined}
                            >
                                {item.label}
                            </button>
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
};
