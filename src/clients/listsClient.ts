import { List } from '../types/list';
import {Client} from "./client";

export class ListsClient extends Client {
   async GetLists(folderId: string): Promise<List[]> {
        const res = await this.Fetch(`api/v2/folder/${folderId}`)
        return JSON.parse(res).lists as List[];
    }

    async GetFolderlessLists(spaceId: string): Promise<List[]> {
        const res = await this.Fetch(`api/v2/space/${spaceId}/list`)
        return JSON.parse(res).lists as List[];
    }

    async GetList(listId: string): Promise<List> {
        const res = await this.Fetch(`api/v2/list/${listId}`)
        return JSON.parse(res) as List;
    }
}
