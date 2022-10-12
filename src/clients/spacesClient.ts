import fetch from 'node-fetch';
import { List } from '../types/list';
import {Client} from "./client";
import {Space} from "../types/space";

export class SpacesClient extends Client {
    async GetSpaces(teamId: string): Promise<Space[]> {
        const res= await this.Fetch(`api/v2/team/${teamId}/space`)
        return JSON.parse(res).spaces as Space[];
    }

    async GetSpace(spaceId: string): Promise<Space> {
        const res = await this.Fetch(`api/v2/space/${spaceId}`)
        return JSON.parse(res) as Space;
    }
}
