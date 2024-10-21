import * as core from '@actions/core';
import * as github from '@actions/github';

import { GithubPullRequestParams, GithubUpdateIssueParams, JiraIssue } from './types';
import { GitHub } from './github';
import { Jira } from './jira';

const run = async () => {
	try {
		const jiraUser: string = core.getInput('jira-user', { required: true });
		const jiraToken: string = core.getInput('jira-token', { required: true });
		const jiraBaseURL: string = core.getInput('jira-base-url', { required: true });
		const githubToken: string = core.getInput('github-token', { required: true });
		const commentHeader: string = core.getInput('comment-header', {
			trimWhitespace: false,
			required: false,
		});
		const commentTrailer: string = core.getInput('comment-trailer', {
			trimWhitespace: false,
			required: false,
		});
		const failOnError: boolean = core.getInput('fail-on-error', { required: false }) !== 'false';
		const forceUpdate: boolean = core.getInput('force-update', { required: false }) === 'true';
		const updateBody: boolean = core.getInput('update-body', { required: false }) === 'true';
		const includeTitle: boolean = core.getInput('include-title', { required: false }) === 'true';
		const linkPrefix: string = core.getInput('link-prefix', {
			required: false,
			trimWhitespace: false,
		});

		const exit = (message: string): void => {
			let exitCode = 0;

			if (failOnError) {
				core.setFailed(message);
				exitCode = 1;
			} else {
				console.log(message);
			}

			process.exit(exitCode);
		};

		const {
			payload: { repository, pull_request: pullRequest, action },
		} = github.context;

		if (typeof repository === 'undefined') {
			return exit(`Missing 'repository' from github action context.`);
		}

		if (typeof pullRequest === 'undefined') {
			console.log(`Missing 'pull_request' from github action context. Skipping.`);
			return;
		}

		if (!forceUpdate && action !== 'opened') {
			console.log('Skipping action to ensure we only comment once.');
			return;
		}

		const {
			name: repo,
			owner: { login: owner },
		} = repository;

		const {
			base: { ref: baseBranch },
			head: { ref: headBranch },
			number: prNumber = 0,
		} = pullRequest as GithubPullRequestParams;

		// common fields for both issue and comment
		const commonPayload: GithubUpdateIssueParams = { owner, repo, issue: prNumber };
		const gh = new GitHub(githubToken);
		const jira = new Jira(jiraBaseURL, jiraUser, jiraToken);

		if (!headBranch && !baseBranch) {
			if (!updateBody) {
				await gh.addComment({
					...commonPayload,
					body: 'action-jira-linker is unable to determine the head and base branch.',
				});
			}

			return exit('Unable to get the head and base branch.');
		}

		console.log('Base branch -> ', baseBranch);
		console.log('Head branch -> ', headBranch);

		const issueKeys = Jira.getJIRAIssueKeys(headBranch);
		if (!issueKeys.length) {
			console.log(`Could not find a JIRA issue key in your branch name. Skipping.`);
			return;
		}

		// use the last match (end of the branch name)
		const issueKey = issueKeys[issueKeys.length - 1];
		console.log(`JIRA key -> ${issueKey}`);

		let ticketData: JiraIssue;
		try {
			ticketData = await jira.getIssue(issueKey);
		} catch (error) {
			console.error(`Error while retrieving issue with key ${issueKey} from JIRA: `, error);
			console.log('Skipping.');
			return;
		}

		const {
			key,
			fields: { summary },
		} = ticketData;
		const linkText = includeTitle ? `${key}: ${summary}` : key;
		const linkBody =
			commentHeader + `${linkPrefix}[${linkText}](${jiraBaseURL}/browse/${key})` + commentTrailer;

		if (key) {
			if (updateBody) {
				console.log('Successfully retrieved issue from JIRA. Adding link to body of issue.');
				await gh.updateBody({ ...commonPayload, linkBody });
			} else {
				console.log('Successfully retrieved issue from JIRA. Adding link comment for issue.');
				await gh.addComment({ ...commonPayload, body: linkBody });
			}
		} else {
			if (!issueKeys.length) {
				console.log(`Could not find JIRA issue for key ${issueKey}. Skipping.`);
				return;
			}
		}
	} catch (error) {
		console.log({ error });

		core.setFailed((error as Error)?.message ?? 'FATAL: An unknown error occurred');
		process.exit(1);
	}
};

run();
