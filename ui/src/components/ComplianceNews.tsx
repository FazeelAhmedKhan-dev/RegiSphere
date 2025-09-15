type NewsItem = {
    title: string;
    source: string;
    time: string;
};

const complianceNews: NewsItem[] = [
    {
        title: "EU strengthens GDPR enforcement with new fines",
        source: "TechCrunch",
        time: "2h ago",
    },
    {
        title: "US SEC proposes tighter crypto custody rules",
        source: "CoinDesk",
        time: "6h ago",
    },
    {
        title: "FATF releases updated AML guidance for DeFi",
        source: "Reuters",
        time: "1d ago",
    },
];

export default function ComplianceNews() {
    return (
        <div className="border-t bg-white">
            <h3 className="px-6 pt-4 text-sm font-semibold text-gray-800">
                Latest Compliance News
            </h3>

            <div className="p-4 space-y-3">
                {complianceNews.map((item, idx) => (
                    <div
                        key={idx}
                        className="group rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md hover:border-gray-300"
                    >
                        <div className="flex items-start justify-between">
                            <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700">
                                {item.title}
                            </span>
                            <span className="text-xs text-gray-400">{item.time}</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">{item.source}</div>
                    </div>
                ))}
            </div>

            <div className="px-4 pb-4 pt-2">
                <button className="w-full text-sm text-left px-3 py-2 rounded hover:bg-gray-50 text-blue-700 font-medium">
                    View All News →
                </button>
            </div>
        </div>
    );
}
