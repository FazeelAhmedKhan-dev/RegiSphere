import RecentProjects from './RecentProjects'
import ComplianceNews from './ComplianceNews'

export default function Sidebar() {
    return (
        <aside className="w-72 bg-white border-r flex flex-col">
            <RecentProjects />
            <ComplianceNews/>
        </aside>
    )
}
