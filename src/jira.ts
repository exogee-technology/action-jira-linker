import axios, { AxiosInstance } from 'axios';
import { JiraIssue } from './types';

const JIRA_REGEX_MATCHER = /[a-z0-9]{1,10}-\d+/gi;

export class Jira {
	client: AxiosInstance;
	baseURL: string;

	constructor(baseURL: string, username: string, token: string) {
		this.baseURL = baseURL;
		this.client = this.getJIRAClient(baseURL, username, token);
	}

	/** Extract JIRA issue keys from a string. */
	static getJIRAIssueKeys = (input: string): string[] => input.match(JIRA_REGEX_MATCHER) ?? [];

	private getJIRAClient = (baseURL: string, username: string, token: string) => {
		const credentials = `${username}:${token}`;
		const authorization = Buffer.from(credentials).toString('base64');
		return axios.create({
			baseURL: `${baseURL}/rest/api/3`,
			timeout: 2000,
			headers: { authorization: `Basic ${authorization}` },
		});
	};

	getIssue = async (id: string) => {
		const { data } = await this.client.get<JiraIssue>(
			`/issue/${id}?fields=project,summary,issuetype,status`
		);
		return data;
	};
}
