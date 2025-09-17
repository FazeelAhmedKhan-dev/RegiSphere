const recentProjects = [
    { name: 'DeFi-Protocol-V2', status: 'success', lastScan: '2h ago' },
    { name: 'NFT-Marketplace', status: 'warning', lastScan: '1d ago' },
    { name: 'DAO-Governance', status: 'error', lastScan: '3d ago' },
];

const statusStyles: Record<string, string> = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
};

export default function RecentProjects() {
    return (
        <div className="w-full">
            <h2 className="px-6 pt-4 text-lg font-semibold text-gray-800">
                Recent Projects
            </h2>

            <div className="p-4 space-y-3">
                {recentProjects.map((proj) => (
                    <div
                        key={proj.name}
                        className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm transition hover:shadow-md hover:border-gray-300"
                    >
                        {/* Left: name + scan info */}
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-800">{proj.name}</span>
                            <span className="text-xs text-gray-500">
                                Last scan: {proj.lastScan}
                            </span>
                        </div>

                        {/* Right: status pill */}
                        <span
                            className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${statusStyles[proj.status]}`}
                        >
                            {proj.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
