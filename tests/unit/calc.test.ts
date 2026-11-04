// [TEST] Kiểm thử đơn vị các công thức tính điểm · tài liệu mục 7.8
import { describe, it, expect } from "vitest";
import { reviewScore, peerScore, finalScore } from "@/shared/scoring/calc";
import testVectors from "@/shared/scoring/test-vectors.json";

describe("calc.ts scoring logic", () => {
  it("tính điểm phiếu đánh giá BARS theo vector 1", () => {
    const vector = testVectors.reviewScore[0];
    if (!vector) throw new Error("Missing test vector");
    const score = reviewScore(vector.answers);
    expect(score).toBe(vector.expected); // 7.5
  });

  it("tính điểm đồng đẳng trung bình cộng và mảng rỗng", () => {
    const v1 = testVectors.peerScore[0];
    const v2 = testVectors.peerScore[1];
    if (!v1 || !v2) throw new Error("Missing test vectors");

    expect(peerScore(v1.reviewScores)).toBe(v1.expected); // 8.0
    expect(peerScore(v2.reviewScores)).toBe(v2.expected); // null
  });

  it("tính điểm cuối với weightGroup = 0.6, groupScore = 8.5, peerScore = 7.0 cho 7.9", () => {
    const v = testVectors.finalScore[0];
    if (!v) throw new Error("Missing test vector");
    const result = finalScore(v.input);
    expect(result).toBe(v.expected); // 7.9
  });

  it("thiếu điểm đồng đẳng (peerScore null) thì trả điểm nhóm", () => {
    const v = testVectors.finalScore[1];
    if (!v) throw new Error("Missing test vector");
    const result = finalScore(v.input);
    expect(result).toBe(v.expected); // 8.5
  });

  it("biên weightGroup = 0 (hoàn toàn theo điểm đồng đẳng)", () => {
    const v = testVectors.finalScore[2];
    if (!v) throw new Error("Missing test vector");
    const result = finalScore(v.input);
    expect(result).toBe(v.expected); // 7.0
  });

  it("biên weightGroup = 1 (hoàn toàn theo điểm nhóm)", () => {
    const v = testVectors.finalScore[3];
    if (!v) throw new Error("Missing test vector");
    const result = finalScore(v.input);
    expect(result).toBe(v.expected); // 8.5
  });
});
