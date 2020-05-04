import Home from './components/Home'
import TimeLogLastEntries from './components/TimeLogLastEntries'
import TimeLogOverview from "./components/TimeLogOverview";
import UserManagement from './components/UserManagement'
import Workplan from './components/Workplan'
import Reports from "./components/Reports";
import PreparationOverview from "./components/PreparationOverview";
import AppointmentOverview from "./components/AppointmentOverview";
import Call from "./components/Call";
import PatientWrapper from "./components/PatientWrapper";
import PatientAutoOpener from "./components/PatientAutoOpener";
import GeriatricAssessment from "./components/GeriatricAssessment";
import DMPOverview from "./components/DMPOverview";
import QuarterPerformanceComparison from "./components/QuarterPerformanceComparison";
import AnsweringMachine from "./components/AnsweringMachine";
import ChronikerOverview from "./components/ChronikerOverview";
import Todo from "./components/Todo"

export default {
    mode: 'history',
    routes: [
        {
            path: '/',
            component: Home
        },
        {
            path: '/patient/auto/:id?',
            component: PatientAutoOpener
        },
        {
            path: '/patient/:id',
            component: PatientWrapper
        },
        {
            path: '/reports',
            component: Reports
        },
        {
            path: "/time",
            component: TimeLogLastEntries
        },
        {
            path: "/time-overview",
            component: TimeLogOverview
        },
        {
            path: "/user-management",
            component: UserManagement
        },
        {
            path: "/workplan",
            component: Workplan
        },
        {
            path: "/call/:id?",
            component: Call
        },
        {
            path: "/calendar/:date?/:id?",
            component: PreparationOverview
        },
        {
            path: "/calendar-overview/:date?",
            component: AppointmentOverview
        },
        {
            path: "/geriatric-assessment",
            component: GeriatricAssessment
        },
        {
            path: "/dmp-overview",
            component: DMPOverview
        },
        {
            path: "/chroniker-overview",
            component: ChronikerOverview
        },
        {
            path: "/performance-comparison",
            component: QuarterPerformanceComparison
        },
        {
            path: "/answering-machine/:date?",
            component: AnsweringMachine
        },
        {
            path: "/todo/:type?",
            component: Todo
        }
    ]
}
