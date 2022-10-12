import {Client} from "./client";
import {Team} from "../types/team";

export class TeamsClient extends Client {
    async GetTeams(): Promise<Team[]> {
        const res= await this.Fetch(`api/v2/team`)
        return JSON.parse(res).teams as Team[];
    }
}
