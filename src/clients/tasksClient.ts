import { List } from '../types/list';
import {Client} from "./client";
import {Task} from "../types/task";

export class TasksClient extends Client {
   async GetTasks(listId: string): Promise<Task[]> {
        const res = await this.Fetch(`api/v2/list/${listId}/task`)
        return JSON.parse(res).tasks as Task[];
    }

}
