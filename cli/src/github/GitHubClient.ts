import { Octokit } from '@octokit/rest';

export interface GitHubClientConfig {
  token: string;
  owner: string;
  repo: string;
}

export class GitHubClient {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(config: GitHubClientConfig) {
    this.octokit = new Octokit({ auth: config.token });
    this.owner = config.owner;
    this.repo = config.repo;
  }

  /**
   * 获取指定 PR 的详细信息
   * @param prNumber - PR 编号
   */
  async getPullRequest(prNumber: number) {
    return this.octokit.pulls.get({
      owner: this.owner,
      repo: this.repo,
      pull_number: prNumber
    });
  }

  /**
   * 获取仓库的所有 PR 列表
   * @param state - PR 状态（open, closed, all）
   */
  async listPullRequests(state: 'open' | 'closed' | 'all' = 'open') {
    const response = await this.octokit.pulls.list({
      owner: this.owner,
      repo: this.repo,
      state
    });
    return response.data;
  }

  /**
   * 获取 PR 的 diff 内容
   * @param prNumber - PR 编号
   */
  async getPullRequestDiff(prNumber: number): Promise<string> {
    const response = await this.octokit.pulls.get({
      owner: this.owner,
      repo: this.repo,
      pull_number: prNumber
    });
    
    // 获取diff URL
    const diffUrl = response.data.diff_url;
    if (!diffUrl) {
      throw new Error('Failed to get diff URL');
    }
    
    // 使用 fetch 获取 diff 内容
    const resp = await fetch(diffUrl);
    if (!resp.ok) {
      throw new Error(`Failed to fetch diff: ${resp.status}`);
    }
    
    return await resp.text();
  }

  /**
   * 创建 PR 评论
   * @param prNumber - PR 编号
   * @param body - 评论内容
   */
  async createPullRequestComment(prNumber: number, body: string) {
    return this.octokit.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: prNumber,
      body
    });
  }

  /**
   * 为 PR 创建审查评论
   * @param prNumber - PR 编号
   * @param commitId - 提交 ID
   * @param path - 文件路径
   * @param body - 评论内容
   * @param line - 行号
   */
  async createPullRequestReviewComment(
    prNumber: number,
    commitId: string,
    path: string,
    body: string,
    line: number
  ) {
    return this.octokit.pulls.createReviewComment({
      owner: this.owner,
      repo: this.repo,
      pull_number: prNumber,
      commit_id: commitId,
      path,
      body,
      side: 'RIGHT',
      line
    });
  }

  /**
   * 提交 PR 审查（通过/建议/拒绝）
   * @param prNumber - PR 编号
   * @param state - 审查状态（APPROVE, REQUEST_CHANGES, COMMENT）
   * @param body - 审查评论
   */
  async submitPullRequestReview(prNumber: number, state: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT', body?: string) {
    return this.octokit.pulls.createReview({
      owner: this.owner,
      repo: this.repo,
      pull_number: prNumber,
      event: state,
      body
    });
  }

  /**
   * 获取 PR 的修改文件列表
   * @param prNumber - PR 编号
   */
  async getPullRequestFiles(prNumber: number) {
    const response = await this.octokit.pulls.listFiles({
      owner: this.owner,
      repo: this.repo,
      pull_number: prNumber
    });
    return response.data;
  }

  /**
   * 更新 PR 的标题和描述
   * @param prNumber - PR 编号
   * @param title - 新标题
   * @param body - 新描述
   */
  async updatePullRequest(prNumber: number, title: string, body: string) {
    return this.octokit.pulls.update({
      owner: this.owner,
      repo: this.repo,
      pull_number: prNumber,
      title,
      body
    });
  }
}
