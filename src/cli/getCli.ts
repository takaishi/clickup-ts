import {Command} from "commander";
import {SpacesClient} from "../clients/spacesClient";
import {TeamsClient} from "../clients/teamsClient";
import {FoldersClient} from "../clients/foldersClient";
import {ListsClient} from "../clients/listsClient";
import {TasksClient} from "../clients/tasksClient";
import {ViewsClient} from "../clients/viewsClient";

export const AppendGetCommands = (program: Command): Command => {
    const get = program.command('get')

    get.command('teams')
        .option('-o, --output <format>', '')
        .action(async (options) => {
            const token = process.env.CLICKUP_TOKEN
            if (token === undefined) {
                throw new Error('Cannot get token');
            }
            const client = new TeamsClient(token)
            const teams = await client.GetTeams()

            if (options.output == "json") {
                console.log(JSON.stringify(teams))
            } else {
                for (const team of teams) {
                    console.log(`${team.id} ${team.name}`)
                }
            }
        })

    get.command('spaces')
        .option('--teamId <id>', '')
        .option('-o, --output <format>', '')
        .action(async (options) => {
            const token = process.env.CLICKUP_TOKEN
            if (token === undefined) {
                throw new Error('Cannot get token');
            }
            const client = new SpacesClient(token)
            const spaces = await client.GetSpaces(options.teamId)

            if (options.output == "json") {
                console.log(JSON.stringify(spaces))
            } else {
                for (const space of spaces) {
                    console.log(`${space.id} ${space.name}`)
                }
            }
        })

    get.command('folders')
        .option('--spaceId <id>', '')
        .option('-o, --output <format>', '')
        .action(async (options) => {
            const token = process.env.CLICKUP_TOKEN
            if (token === undefined) {
                throw new Error('Cannot get token');
            }
            const client = new FoldersClient(token)
            const folders = await client.GetFolders(options.spaceId)

            if (options.output == "json") {
                console.log(JSON.stringify(folders))
            } else {
                for (const folder of folders) {
                    console.log(`${folder.id} ${folder.name}`)
                }
            }
        })

    get.command('lists')
        .option('--folderId <id>', '')
        .option('-o, --output <format>', '')
        .action(async (options) => {
            const token = process.env.CLICKUP_TOKEN
            if (token === undefined) {
                throw new Error('Cannot get token');
            }
            const client = new ListsClient(token)
            const lists = await client.GetLists(options.folderId)

            if (options.output == "json") {
                console.log(JSON.stringify(lists))
            } else {
                for (const list of lists) {
                    console.log(`${list.id} ${list.name}`)
                }
            }
        })

    get.command('tasks')
        .option('--listId <id>', '')
        .option('-o, --output <format>', '')
        .action(async (options) => {
            const token = process.env.CLICKUP_TOKEN
            if (token === undefined) {
                throw new Error('Cannot get token');
            }
            const client = new TasksClient(token)
            const tasks = await client.GetTasks(options.listId)

            if (options.output == "json") {
                console.log(JSON.stringify(tasks))
            } else {
                for (const task of tasks) {
                    console.log(`${task.id} ${task.name}`)
                }
            }
        })

    get.command('spaceViews')
        .option('--spaceId <id>', '')
        .option('-o, --output <format>', '')
        .action(async (options) => {
            const token = process.env.CLICKUP_TOKEN
            if (token === undefined) {
                throw new Error('Cannot get token');
            }
            const client = new ViewsClient(token)
            const views = await client.GetSpaceViews(options.spaceId)

            if (options.output == "json") {
                console.log(JSON.stringify(views))
            } else {
                for (const view of views) {
                    console.log(`${view.id} ${view.name}`)
                }
            }
        })

    get.command('folderViews')
        .option('--folderId <id>', '')
        .option('-o, --output <format>', '')
        .action(async (options) => {
            const token = process.env.CLICKUP_TOKEN
            if (token === undefined) {
                throw new Error('Cannot get token');
            }
            const client = new ViewsClient(token)
            const views = await client.GetFolderViews(options.folderId)

            if (options.output == "json") {
                console.log(JSON.stringify(views))
            } else {
                for (const view of views) {
                    console.log(`${view.id} ${view.name}`)
                }
            }
        })

    get.command('listViews')
        .option('--listId <id>', '')
        .option('-o, --output <format>', '')
        .action(async (options) => {
            const token = process.env.CLICKUP_TOKEN
            if (token === undefined) {
                throw new Error('Cannot get token');
            }
            const client = new ViewsClient(token)
            const views = await client.GetListViews(options.listId)

            if (options.output == "json") {
                console.log(JSON.stringify(views))
            } else {
                for (const view of views) {
                    console.log(`${view.id} ${view.name}`)
                }
            }
        })

    get.command('listViewTasks')
        .option('--viewId <id>', '')
        .option('-o, --output <format>', '')
        .action(async (options) => {
            const token = process.env.CLICKUP_TOKEN
            if (token === undefined) {
                throw new Error('Cannot get token');
            }
            const client = new ViewsClient(token)
            const tasks = await client.GetViewTasks(options.viewId)

            if (options.output == "json") {
                console.log(JSON.stringify(tasks))
            } else {
                for (const task of tasks) {
                    console.log(`${task.id} ${task.name}`)
                }
            }
        })

    return get;
}
