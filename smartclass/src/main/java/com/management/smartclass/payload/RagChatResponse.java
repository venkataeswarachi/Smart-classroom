package com.management.smartclass.payload;

import java.util.List;

public class RagChatResponse {
    private String query;
    private String answer;
    private List<RagSource> sources;
    private int sourceCount;

    public RagChatResponse() {
    }

    public RagChatResponse(String query, String answer, List<RagSource> sources, int sourceCount) {
        this.query = query;
        this.answer = answer;
        this.sources = sources;
        this.sourceCount = sourceCount;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public List<RagSource> getSources() {
        return sources;
    }

    public void setSources(List<RagSource> sources) {
        this.sources = sources;
    }

    public int getSourceCount() {
        return sourceCount;
    }

    public void setSourceCount(int sourceCount) {
        this.sourceCount = sourceCount;
    }

    public static class RagSource {
        private String source;
        private String page;
        private double similarityScore;

        public RagSource() {
        }

        public RagSource(String source, String page, double similarityScore) {
            this.source = source;
            this.page = page;
            this.similarityScore = similarityScore;
        }

        public String getSource() {
            return source;
        }

        public void setSource(String source) {
            this.source = source;
        }

        public String getPage() {
            return page;
        }

        public void setPage(String page) {
            this.page = page;
        }

        public double getSimilarityScore() {
            return similarityScore;
        }

        public void setSimilarityScore(double similarityScore) {
            this.similarityScore = similarityScore;
        }
    }
}
