import React, { 
    useRef, 
    useState, 
    useEffect, 
    ReactNode, 
    createContext,
    useContext,
    useMemo
  } from 'react';
  
  // Context for managing nested list heights
  const AnimatedListContext = createContext<{
    registerChild: (height: number) => void;
    unregisterChild: (height: number) => void;
  } | null>(null);
  
  interface AnimatedListProps {
    isOpen?: boolean;
    children: ReactNode;
    className?: string;
    defaultOpen?: boolean;
  }
  
 export const AnimatedList: React.FC<AnimatedListProps> = ({ 
    isOpen: controlledIsOpen, 
    children, 
    className = '',
    defaultOpen = false
  }) => {
    const parentContext = useContext(AnimatedListContext);
    const contentRef = useRef<HTMLDivElement>(null);
  
    // Track open state (controlled/uncontrolled)
    const [manualIsOpen, setManualIsOpen] = useState(defaultOpen);
    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : manualIsOpen;
  
    // Track content height
    const [contentHeight, setContentHeight] = useState(0);
    const [childrenHeight, setChildrenHeight] = useState(0);
  
    // Register/unregister child heights in parent
    const registerChild = (childHeight: number) => {
      setChildrenHeight(prev => prev + childHeight);
    };
  
    const unregisterChild = (childHeight: number) => {
      setChildrenHeight(prev => prev - childHeight);
    };
  
    // Measure own height when open
    useEffect(() => {
      const content = contentRef.current;
      if (!content) return;
  
      if (isOpen) {
        requestAnimationFrame(() => {
          const newHeight = content.scrollHeight;
          setContentHeight(newHeight);
          parentContext?.registerChild(newHeight);
        });
      } else {
        requestAnimationFrame(() => {
          parentContext?.unregisterChild(contentHeight);
          setContentHeight(0);
        });
      }
    }, [isOpen, childrenHeight]);
  
    // Toggle open state (for uncontrolled mode)
    const toggleOpen = () => {
      if (!isControlled) {
        setManualIsOpen(prev => !prev);
      }
    };
  
    return (
      <AnimatedListContext.Provider value={{ registerChild, unregisterChild }}>
        <div 
          className={`animated-list ${className}`}
          style={{
            maxHeight: isOpen ? `${contentHeight + childrenHeight}px` : '0px',
            overflow: 'hidden',
            transition: 'max-height 300ms ease-in-out, opacity 200ms ease',
            opacity: isOpen ? 1 : 0,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              toggleOpen();
            }
          }}
        >
          <div ref={contentRef}>{children}</div>
        </div>
      </AnimatedListContext.Provider>
    );
  };
  