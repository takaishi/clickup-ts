import fetch from 'node-fetch';

const CLICKUP_BASE_URL = "https://api.clickup.com"

export class Client {
    token: string;

    constructor(token: string) {
        this.token = token
    }

    async Fetch(path: string): Promise<any> {
        const res = await fetch(`${CLICKUP_BASE_URL}/${path}`, {
            headers: {
                "Authorization": this.token
            }
        })
        if (!res.ok) {
            return Promise.reject(new Error(`${res.status} ${res.statusText}`))
        }
        return res.text();
    }
}
