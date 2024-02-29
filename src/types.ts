export interface GithubUpdateParams {
	owner: string;
	repo: string;
}

export interface GithubUpdateIssueParams extends GithubUpdateParams {
	issue: number;
}

export interface GithubPullRequestParams {
	number: number;
	html_url?: string;
	body?: string;
	base: {
		ref: string;
	};
	head: {
		ref: string;
	};
	changed_files?: number;
	additions?: number;
	title?: string;
	[key: string]: unknown;
}

export interface JiraIssueStatus {
	self: string;
	description: string;
	iconUrl: string;
	name: string;
	id: string;
	statusCategory: {
		self: string;
		id: number;
		key: string;
		colorName: string;
		name: string;
	};
}

export interface JiraIssuePriority {
	self: string;
	iconUrl: string;
	name: string;
	id: string;
}

export interface JiraIssueType {
	self: string;
	id: string;
	description: string;
	iconUrl: string;
	name: string;
	subtask: boolean;
	avatarId: number;
}

export interface JiraIssueProject {
	self: string;
	key: string;
	name: string;
}

export interface JiraIssue {
	id: string;
	key: string;
	self: string;
	status: string;
	fields: {
		summary: string;
		status: JiraIssueStatus;
		priority: JiraIssuePriority;
		issuetype: JiraIssueType;
		project: JiraIssueProject;
		labels: string[];
		[k: string]: unknown;
	};
}
