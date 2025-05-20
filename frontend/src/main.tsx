import React from 'react';
import ReactDOM from 'react-dom/client';
import classNames from 'classnames';
import './css/main.css';

enum API_STATUS {
  LOADING = 'loading',
  ERROR = 'error',
  IDLE = 'idle'
}

interface OCRResult {
  text: string;
  confidence: number;
}

const OCRApp = () => {
  const [status, setStatus] = React.useState<API_STATUS>(API_STATUS.IDLE);
  const [ocrResults, setOcrResults] = React.useState<OCRResult[]>([]);
  const [imageUrl, setImageUrl] = React.useState('');

  const handleImageUrlSubmitted = async (url: string) => {
    setImageUrl(url);
    setStatus(API_STATUS.LOADING);
    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl: url })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setOcrResults(data);
      setStatus(API_STATUS.IDLE);
    } catch (error) {
      console.error('Error fetching OCR results:', error);
      setStatus(API_STATUS.ERROR);
    }
  };

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleImageUrlSubmitted(imageUrl);
    }
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setImageUrl(event.target.value);
  };

  return (
    <div className="main">
      <p>status: <span className={classNames('api-status', status)}>{status}</span></p>

      <input
        type="text"
        placeholder="Enter image URL"
        value={imageUrl}
        onChange={handleOnChange} // just so this is a controlled input
        onKeyDown={handleOnKeyDown}
      />

      <h2>Results:</h2>
      <div className="result-table">
        {ocrResults.length > 0 && ocrResults.map((item, idx) => {
          return <div className="result-span" key={`${idx}-${item.text}`}>{item.text}</div>
        })}
      </div>
    </div>
  );
};

const App = () => (
  <div>
    <h1>OCR App</h1>
    <OCRApp />
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
