import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import api from "../utils/api";

export default function ProblemDetailPage() {
  const { id } = useParams();

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // 🔹 Fetch Problem
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await api.get(`/problems/${id}`);
        setProblem(res.data.data);

        setCode(
`import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Write your code here

    }
}`
        );
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchProblem();
  }, [id]);

  // 🔹 Submit Code
  const handleSubmit = async () => {
    if (!code.trim()) {
      alert("Write code first!");
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const res = await api.post("/submissions", {
        problemId: Number(id),
        code,
        language: "JAVA",
      });

      setResult(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    }

    setSubmitting(false);
  };

  if (loading) return <p style={{ color: "white", padding: 20 }}>Loading...</p>;

  if (!problem)
    return <p style={{ color: "red", padding: 20 }}>Problem not found</p>;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f172a", color: "white" }}>

      {/* LEFT SIDE */}
      <div style={{ width: "45%", padding: 20, overflowY: "auto", borderRight: "1px solid #333" }}>
        <Link to="/problems" style={{ color: "#38bdf8" }}>← Back</Link>

        <h2 style={{ marginTop: 10 }}>{problem.title}</h2>

        <p style={{ color: "#94a3b8" }}>
          Difficulty: {problem.difficulty}
        </p>

        <p style={{ marginTop: 10, whiteSpace: "pre-line" }}>
          {problem.description}
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* TOP BAR */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          padding: 10,
          borderBottom: "1px solid #333",
          background: "#020617"
        }}>
          <span>Solution.java</span>

          {/* ✅ SUBMIT BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              background: "#22c55e",
              color: "white",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer"
            }}
          >
            {submitting ? "Running..." : "Submit"}
          </button>
        </div>

        {/* EDITOR */}
        <div style={{ flex: 1 }}>
          <Editor
            height="100%"
            language="java"
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
          />
        </div>

        {/* RESULT PANEL */}
        {result && (
          <div style={{
            padding: 15,
            borderTop: "1px solid #333",
            background: "#020617"
          }}>
            <h4>Result:</h4>

            <p>Status: {result.status}</p>
            <p>
              Passed: {result.testCasesPassed} / {result.totalTestCases}
            </p>

            {result.errorMessage && (
              <pre style={{ color: "red" }}>{result.errorMessage}</pre>
            )}
          </div>
        )}

      </div>
    </div>
  );
}