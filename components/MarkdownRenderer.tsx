import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Function to render inline styles (bold, italic)
  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[\s\S]+?\*\*|\*[\s\S]+?\*)/g).filter(Boolean);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2 mr-4">
          {currentList.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      currentList.push(trimmedLine.substring(2));
    } else {
      flushList(); // End any existing list
      if (trimmedLine === '---') {
        elements.push(<hr key={`hr-${index}`} className="my-3 border-gray-300 dark:border-gray-800" />);
      } else if (trimmedLine) { // Only render non-empty lines as paragraphs
        elements.push(<p key={`p-${index}`}>{renderInline(line)}</p>);
      }
    }
  });

  flushList(); // Flush any remaining list at the end

  // The main container. Adding text-right to ensure correct alignment for Arabic.
  // dir="rtl" is inherited from the <html> tag, but being explicit here is safer.
  // Color classes have been removed and will be inherited from the parent.
  return (
    <div className="leading-relaxed space-y-2 text-right" dir="rtl">
      {elements}
    </div>
  );
};

export default MarkdownRenderer;