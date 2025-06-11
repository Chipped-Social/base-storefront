import React, { useEffect } from 'react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    // Save the original overflow value
    const originalOverflow = document.body.style.overflow;
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    // Cleanup function to restore scrolling when component unmounts or modal closes
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.overflowY = 'auto';
      document.body.style.position = '';
    };
  }, [isOpen]);

  // Extra handler to ensure body scroll is restored when modal is closed via the Done button
  const handleCloseClick = () => {
    document.body.style.overflow = 'auto';
    document.body.style.overflowY = 'auto';
    document.body.style.position = '';
    onClose();
  };

  // Handle click outside the modal content to close it
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseClick();
    }
  };

  return (
    <div 
      className="modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="modal-content size-guide-modal">
        <h2 className="modal-title">HOW TO MEASURE YOUR NAIL SIZE</h2>
        
        <div className="size-examples">
          <div className="size-example">
            <div className="size-image s-size"> S </div>
            <div className="size-label">15mm</div>
            <div className="size-inches">0.59inch</div>
          </div>
          <div className="size-example">
            <div className="size-image m-size"> M </div>
            <div className="size-label">16mm</div>
            <div className="size-inches">0.629inch</div>
          </div>
          <div className="size-example">
            <div className="size-image l-size"> L </div>
            <div className="size-label">17mm</div>
            <div className="size-inches">0.669inch</div>
          </div>
        </div>
        
        <div className="size-info">
          If you're between sizes, we recommend choosing
          the larger size and filing down to fit.
        </div>
        
        <div className="measurement-methods">
          <div className="method">
            <div className="method-image method-one">
              <img src="/assets/nail1.png" alt="Nail measurement with paper and rule" />
            </div>
            <div className="method-info">
              <div className="method-title">METHOD ONE: USING PAPER + A RULER</div>
              <ul className="method-steps">
                <li>Lay a small strip of paper of your thumbnail.</li>
                <li>Mark the paper where your nail meets the skin on the widest part of your nail bed.</li>
                <li>Measure the distance between the marks.</li>
              </ul>
            </div>
          </div>
          
          <div className="method">
            <div className="method-image method-two">
              <img src="/assets/nail2.png" alt="Nail measurement with tape measure" />
            </div>
            <div className="method-info">
              <div className="method-title">METHOD TWO: USING A TAPE MEASURE</div>
              <ul className="method-steps">
                <li>Grab a flexible tape measure and measure your thumbnail from one side to the other at the widest part, where your nail meets the skin</li>
              </ul>
            </div>
          </div>
        </div>
        
        <button className="done-button" onClick={handleCloseClick}>Done</button>
      </div>
    </div>
  );
};

export default SizeGuideModal;
