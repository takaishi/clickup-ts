export interface List {
    id: string
    name: string
    orderindex: number
    content: string
    status: {
        status: string
        color: string
        hide_label: boolean
    }
    priority: {
        priority: string
        color: string
    }
    assignee: boolean
    task_count: number
    due_date: number
    due_date_time: boolean
    start_date: number,
    start_date_time: boolean
    folder: {
        id: string
        name: string
        hidden: boolean
        access: boolean
    },
    space: {
        id: string
        name: string
        access: boolean
    },
    inbound_address: string
    archived: boolean
    statuses: [
        {
            status: string
            orderindex: number
            color: string
            type: string
        },
    ],
    permission_level: string
}
