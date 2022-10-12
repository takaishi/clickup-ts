import fetch from 'node-fetch';
import { List } from '../types/list';
import {Client} from "./client";
import {Folder} from "../types/folder";

export class FoldersClient extends Client {
   async GetFolders(spaceId: string): Promise<Folder[]> {
        const res= await this.Fetch(`api/v2/space/${spaceId}/folder`)
        return JSON.parse(res).folders as Folder[];
    }

    async GetFolder(folderId: string): Promise<List> {
        const res = await this.Fetch(`api/v2/folder/${folderId}`)
        return JSON.parse(res) as List;
    }
}
