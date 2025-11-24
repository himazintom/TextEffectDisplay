import React, { useState } from 'react';
import type { TreeNode } from './data';

interface FileNodeProps {
    node: TreeNode;
}

const FileNode: React.FC<FileNodeProps> = ({ node }) => {
    const [expanded, setExpanded] = useState(false);
    const isDir = node.type === 'directory';
    const hasChildren = isDir && node.children && node.children.length > 0;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDir) {
            setExpanded(!expanded);
        } else {
            const query = node.name.replace(/\.[^/.]+$/, "");
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
        }
    };

    return (
        <div className="file-node-container" style={{ marginLeft: '20px' }}>
            <div
                onClick={handleClick}
                className="file-node-item"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: '#e0e0e0',
                    transition: 'background-color 0.2s'
                }}
            >
                <span style={{
                    width: '16px',
                    textAlign: 'center',
                    marginRight: '4px',
                    color: '#888',
                    transform: expanded ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s',
                    opacity: hasChildren ? 1 : 0
                }}>
                    ▶
                </span>
                <span style={{ marginRight: '8px', fontSize: '1.2em' }}>
                    {isDir ? '📁' : '🎵'}
                </span>
                <span className="node-name">{node.name}</span>
            </div>

            {hasChildren && expanded && (
                <div style={{
                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                    marginLeft: '9px',
                    paddingLeft: '11px'
                }}>
                    {node.children!.map((child, idx) => (
                        <FileNode key={`${child.name}-${idx}`} node={child} />
                    ))}
                </div>
            )}
        </div>
    );
};

interface BrowserProps {
    tree: TreeNode;
}

const Browser: React.FC<BrowserProps> = ({ tree }) => {
    return (
        <div className="browser-view" style={{
            padding: '80px 2rem 2rem 2rem',
            height: '100vh',
            overflowY: 'auto',
            backgroundColor: '#0f0f13',
            color: '#e0e0e0',
            fontFamily: "'Inter', sans-serif"
        }}>
            <FileNode node={tree} />
        </div>
    );
};

export default Browser;
