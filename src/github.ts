import * as core from '@actions/core';
import * as octokit from '@octokit/rest';
import { CreateIssueCommentParams, UpdateBodyParams } from './types';

const BODY_HEADER = '<!-- jira link -->\r\n';
const BODY_FOOTER = '\r\n<!-- end jira link -->';

export class GitHub {
	client: octokit.Octokit;

	constructor(token: string) {
		this.client = new octokit.Octokit({ auth: token });

		if (this.client === undefined || this.client === null) {
			throw new Error('Unable to create GitHub client');
		}
	}

	addComment = async (comment: CreateIssueCommentParams): Promise<void> => {
		try {
			const { owner, repo, issue: issue_number, body } = comment;
			await this.client.issues.createComment({
				owner,
				repo,
				issue_number,
				body,
			});
		} catch (error) {
			console.error(error);
			core.setFailed((error as Error)?.message ?? 'Failed to add comment');
		}
	};

	updateBody = async (comment: UpdateBodyParams): Promise<void> => {
		try {
			const { owner, repo, issue: issue_number, linkBody } = comment;
			const issue = await this.client.issues.get({ owner, repo, issue_number });
			let issueBody = issue.data.body;
			const body = `${BODY_HEADER}${linkBody}${BODY_FOOTER}`;
			if (!issueBody) {
				await this.client.issues.update({ owner, repo, issue_number, body });
			} else {
				issueBody = issueBody.replace(new RegExp(`${BODY_HEADER}.*${BODY_FOOTER}`, 's'), '');
				await this.client.issues.update({
					owner,
					repo,
					issue_number,
					body: `${body}\n\n${issueBody}`,
				});
			}
		} catch (error) {
			console.error(error);
			core.setFailed((error as Error)?.message ?? 'Failed to update title');
		}
	};
}
