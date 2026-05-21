import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PAGE_SIZE } from './constants';

export default function PaginatedList({ items, renderItem }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const slice = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="tb-paged">
      <ol className="tb-list">
        {slice.map((item, i) => renderItem(item, page * PAGE_SIZE + i))}
      </ol>
      {totalPages > 1 && (
        <div className="tb-pagination">
          <button className="tb-pg-btn" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
            <ArrowLeft size={13} />
          </button>
          <span className="tb-pg-label">{page + 1} / {totalPages}</span>
          <button className="tb-pg-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages - 1}>
            <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
