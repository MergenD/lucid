import React, { useState, useRef, useEffect } from 'react';
import { Input, Dropdown, Menu, Tag, InputRef } from 'antd';
import { useFormulaStore, Token } from '../store/store';
import { useAutocompleteQuery } from '../services/useAutocompleteQuery';
import { v4 as uuidv4 } from 'uuid';

const dummyMapping: Record<string, number> = {
  Revenue: 100,
  Expense: 50,
  Profit: 20,
};

const FormulaInput = () => {
  const { tokens, addToken, removeToken } = useFormulaStore();
  const [currentInput, setCurrentInput] = useState('');
  const [calculatedValue, setCalculatedValue] = useState<number | string>('');
  const inputRef = useRef<InputRef>(null);

  const { data: suggestions } = useAutocompleteQuery();

  const filteredSuggestions =
    currentInput && suggestions
      ? suggestions.filter((suggestion) =>
          suggestion.name.toLowerCase().includes(currentInput.toLowerCase())
        )
      : [];

  const dedupedSuggestions = Array.from(
    new Map(filteredSuggestions.map((s) => [s.value, s])).values()
  );

  const determineTokenType = (input: string): Token['type'] => {
    if (!isNaN(Number(input))) return 'number';
    if (/^[+\-*/^()]+$/.test(input)) return 'operator';
    return 'tag';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (currentInput.trim() !== '') {
        const token: Token = {
          id: uuidv4(),
          type: determineTokenType(currentInput),
          value: currentInput,
        };
        addToken(token);
        setCurrentInput('');
      }
    } else if (e.key === 'Backspace' && currentInput === '') {
      if (tokens.length > 0) {
        removeToken(tokens[tokens.length - 1].id);
      }
    }
  };

  const handleSelectSuggestion = (suggestion: {
    value: string;
    name: string;
  }) => {
    const token: Token = {
      id: uuidv4(),
      type: 'tag',
      value: suggestion.value,
    };
    addToken(token);
    setCurrentInput('');
    inputRef.current?.focus();
  };

  const tokenDropdownMenu = (tokenId: string) => (
    <Menu>
      <Menu.Item key='remove' onClick={() => removeToken(tokenId)}>
        Remove Token
      </Menu.Item>
    </Menu>
  );

  useEffect(() => {
    if (tokens.length === 0) {
      setCalculatedValue('');
      return;
    }

    let expr = '';
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      console.log(token);
      let tokenValue = '';
      if (token.type === 'tag') {
        if (Object.prototype.hasOwnProperty.call(dummyMapping, token.value)) {
          tokenValue = dummyMapping[token.value].toString();
        } else {
          tokenValue = '(' + token.value.toString().replace(/\s+/g, '') + ')';
        }
      } else {
        tokenValue = token.value;
      }
      expr += tokenValue;
      if (i < tokens.length - 1) {
        const currentType = token.type;
        const nextType = tokens[i + 1].type;
        if (currentType !== 'operator' && nextType !== 'operator') {
          expr += '+';
        }
      }
    }

    try {
      const result = new Function('return ' + expr)();
      setCalculatedValue(result);
    } catch (error) {
      console.error('Error evaluating expression:', error);
      setCalculatedValue('Error');
    }
  }, [tokens]);

  return (
    <div>
      <div
        style={{
          position: 'relative',
          border: '1px solid #ccc',
          padding: '8px',
          borderRadius: '4px',
          minHeight: '40px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {tokens.map((token) => (
          <Dropdown
            overlay={tokenDropdownMenu(token.id)}
            trigger={['click']}
            key={token.id}
          >
            <Tag style={{ cursor: 'pointer', marginBottom: '4px' }}>
              {token.value}
            </Tag>
          </Dropdown>
        ))}
        <Input
          ref={inputRef}
          style={{
            border: 'none',
            outline: 'none',
            flex: '1 0 auto',
            minWidth: '120px',
          }}
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Type formula here...'
        />
        {currentInput && dedupedSuggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              background: '#fff',
              border: '1px solid #ccc',
              zIndex: 10,
              width: '100%',
            }}
          >
            {dedupedSuggestions.map((suggestion) => (
              <div
                key={suggestion.value}
                onClick={() => handleSelectSuggestion(suggestion)}
                style={{ padding: '4px', cursor: 'pointer' }}
              >
                {suggestion.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ marginTop: '8px' }}>
        <strong>Calculated Value:</strong> {calculatedValue}
      </div>
    </div>
  );
};

export default FormulaInput;
