import React from 'react';
import './AlgoDocs.css';
import { ArrowLeft, Box, Cpu, Database, Layers, GitBranch, Zap, Clock } from 'lucide-react';

export default function AlgoDocs() {
  return (
    <div className="docs-root">
      <div className="docs-container">
        <a href="/sort" className="back-link">
          <ArrowLeft size={16} />
          Back to Visualizer
        </a>

        <header className="docs-header">
          <h1>Algorithms 101</h1>
          <p>A simple guide to how computers solve problems and store data.</p>
        </header>

        <section className="docs-section">
          <h2>What is an Algorithm?</h2>
          <div className="docs-content">
            <p>
              In simple terms, an algorithm is a <strong>recipe</strong>. It's a specific set of instructions that a computer follows to complete a task or solve a problem.
            </p>
            <p>
              Whether it's sorting a list of names, finding the fastest route home, or recommending a movie, an algorithm is the logic behind the action.
            </p>
            <pre>
{`// Example: A simple "Find Max" algorithm
function findMax(list) {
  let max = list[0];
  for (let item of list) {
    if (item > max) max = item;
  }
  return max;
}`}
            </pre>
          </div>
        </section>

        <section className="docs-section">
          <h2>Understanding Big O</h2>
          <div className="docs-content">
            <p>
              Big O notation is how developers measure the <strong>efficiency</strong> of an algorithm. It tells us how the runtime (Time Complexity) or memory usage (Space Complexity) grows as the input size increases.
            </p>
            
            <div className="complexity-grid">
              <div className="complexity-card">
                <div className="comp-not">O(1)</div>
                <div className="comp-name">Constant Time</div>
                <div className="comp-desc">Speed is the same regardless of data size. (e.g., checking the first item in a list)</div>
              </div>
              <div className="complexity-card">
                <div className="comp-not">O(n)</div>
                <div className="comp-name">Linear Time</div>
                <div className="comp-desc">Speed grows directly with data size. (e.g., searching through an unsorted list)</div>
              </div>
              <div className="complexity-card">
                <div className="comp-not">O(n log n)</div>
                <div className="comp-name">Log-Linear Time</div>
                <div className="comp-desc">The "Sweet Spot" for sorting. Fast enough for massive data. (e.g., Quick Sort, Merge Sort)</div>
              </div>
              <div className="complexity-card">
                <div className="comp-not">O(n²)</div>
                <div className="comp-name">Quadratic Time</div>
                <div className="comp-desc">Speed drops quickly as data grows. Usually involves nested loops. (e.g., Bubble Sort)</div>
              </div>
            </div>
          </div>
        </section>

        <section className="docs-section">
          <h2>Core Data Structures</h2>
          <div className="docs-content">
            <p>
              If algorithms are the instructions, data structures are the <strong>containers</strong>. Choosing the right container makes your instructions run faster.
            </p>

            <div className="ds-grid">
              <div className="ds-card">
                <div className="ds-icon-box"><Box size={32} color="#58a6ff" /></div>
                <div className="ds-info">
                  <h3>Array</h3>
                  <p>A simple list of items stored in order. Best for when you know the exact location (index) of what you need.</p>
                  <div className="tag-list">
                    <span className="tag fast">Fast Access</span>
                    <span className="tag slow">Slow Insert</span>
                  </div>
                </div>
              </div>

              <div className="ds-card">
                <div className="ds-icon-box"><Layers size={32} color="#58a6ff" /></div>
                <div className="ds-info">
                  <h3>Stack & Queue</h3>
                  <p>Stacks are Last-In-First-Out (LIFO) like a pile of plates. Queues are First-In-First-Out (FIFO) like a line at the store.</p>
                  <div className="tag-list">
                    <span className="tag">Undo Systems</span>
                    <span className="tag">Task Lists</span>
                  </div>
                </div>
              </div>

              <div className="ds-card">
                <div className="ds-icon-box"><GitBranch size={32} color="#58a6ff" /></div>
                <div className="ds-info">
                  <h3>Trees</h3>
                  <p>Hierarchical data. Files on your computer are stored in a tree structure. Binary Search Trees allow for super fast searching.</p>
                  <div className="tag-list">
                    <span className="tag fast">Fast Search</span>
                    <span className="tag">Organized</span>
                  </div>
                </div>
              </div>

              <div className="ds-card">
                <div className="ds-icon-box"><Database size={32} color="#58a6ff" /></div>
                <div className="ds-info">
                  <h3>Hash Table</h3>
                  <p>Uses a "key" to find a "value" instantly. Like looking up a word in a dictionary.</p>
                  <div className="tag-list">
                    <span className="tag fast">Instant Access</span>
                    <span className="tag">Key-Value</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
