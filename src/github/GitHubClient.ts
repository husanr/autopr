import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';

export interface GitHubClientConfig {
  token: string;
  owner: string;
  repo: string;
}

export class GitHubClient {
  private octokit: Octokit;
  private graphql: typeof graphql;

  constructor(config: GitHubClientConfig) {
    this.octokit = new Octokit({ auth: config.token });
    this.graphql = graphql.defaults({
      headers: {
        authorization: `token ${config.token}`
      }
    });
  }

  async getPullRequest(prNumber: number) {
    return this.octokit.pulls.get({
      owner: 'owner', // TODO: replace with actual owner
      repo: 'repo',   // TODO: replace with actual repo
      pull_number: prNumber
    });
  }

  async createPullRequestReview(prNumber: number, comments: any[]) {
    // TODO: Implement review creation
  }
}