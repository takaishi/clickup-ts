import { List } from '../types/list';
import {Client} from "./client";
import {View} from "../types/view";
import {Task} from "../types/task";

export class ViewsClient extends Client {
   async GetSpaceViews(spaceId: string): Promise<View[]> {
        const res = await this.Fetch(`api/v2/space/${spaceId}/view`)
        return JSON.parse(res).views as View[];
    }

    async GetFolderViews(folderId: string): Promise<View[]> {
        const res = await this.Fetch(`api/v2/folder/${folderId}/view`)
        return JSON.parse(res).views as View[];
    }

    async GetListViews(listId: string): Promise<View[]> {
        const res = await this.Fetch(`api/v2/list/${listId}/view`)
        return JSON.parse(res).views as View[];
    }

    async GetViewTasks(viewId: string): Promise<Task[]> {
        const res = await this.Fetch(`api/v2/view/${viewId}/task`)
        return JSON.parse(res).tasks as Task[];
    }

    async GetView(viewId: string): Promise<View> {
        const res = await this.Fetch(`api/v2/view/${viewId}`)
        return JSON.parse(res) as View;
    }

}
