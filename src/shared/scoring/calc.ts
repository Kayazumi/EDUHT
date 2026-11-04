// [CHUNG] Công thức tính điểm đồng đẳng và điểm cá nhân · tài liệu mục 7.8
import { roundScore2 } from "@/shared/utils/format";

export interface ReviewAnswerItem {
  weight: number;
  points: number;
}

export interface FinalScoreInput {
  groupScore: number;
  peerScore: number | null;
  weightGroup: number;
}

/**
 * Tính điểm của một phiếu đánh giá BARS:
 * P = Σ(weight * points) / Σweight
 */
export function reviewScore(answers: ReviewAnswerItem[]): number {
  if (answers.length === 0) return 0;
  const totalWeight = answers.reduce((sum, a) => sum + a.weight, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = answers.reduce((sum, a) => sum + a.weight * a.points, 0);
  return roundScore2(weightedSum / totalWeight);
}

/**
 * Điểm_ĐĐ của một học sinh:
 * Trung bình cộng các điểm phiếu đã nộp, trả về null nếu chưa nhận phiếu nào
 */
export function peerScore(reviewScores: number[]): number | null {
  if (reviewScores.length === 0) return null;
  const sum = reviewScores.reduce((acc, score) => acc + score, 0);
  return roundScore2(sum / reviewScores.length);
}

/**
 * Điểm_CN (Điểm cuối):
 * a * Điểm_nhóm + (1 - a) * Điểm_ĐĐ
 * Nếu thiếu Điểm_ĐĐ (peerScore là null) thì Điểm_CN = Điểm_nhóm
 */
export function finalScore({ groupScore, peerScore: pScore, weightGroup }: FinalScoreInput): number {
  if (pScore === null) {
    return roundScore2(groupScore);
  }
  const weightPeer = 1 - weightGroup;
  return roundScore2(weightGroup * groupScore + weightPeer * pScore);
}
