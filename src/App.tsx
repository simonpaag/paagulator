// PAAGulator - Professional Calculator Suite
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUpDown, 
  Delete, 
  RefreshCw, 
  X,
  Search,
  ChevronDown,
  Calculator as CalcIcon,
  Coins,
  History,
  Trash2,
  Wind,
  GripVertical,
  Sun,
  Moon,
  Plus,
  Ruler,
  Percent,
  Divide,
  Minus,
  Equal,
  Footprints,
  MoreHorizontal,
  Pin,
  PinOff,
  Clock,
  Download,
  Share
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { SUPPORTED_CURRENCIES, type Currency } from './types';
import { fetchExchangeRates } from './services/currencyService';

declare const __BUILD_TIME__: string;

type Tab = 'currency' | 'calculator' | 'kite' | 'units' | 'percentage' | 'shoesize' | 'timezone';

const TAB_META: Record<Tab, { id: Tab, label: string, icon: React.ElementType }> = {
  currency: { id: 'currency', label: 'Currency', icon: Coins },
  calculator: { id: 'calculator', label: 'Calc', icon: CalcIcon },
  units: { id: 'units', label: 'Units', icon: Ruler },
  percentage: { id: 'percentage', label: 'Percent', icon: Percent },
  shoesize: { id: 'shoesize', label: 'Shoes', icon: Footprints },
  kite: { id: 'kite', label: 'Kite', icon: Wind },
  timezone: { id: 'timezone', label: 'Time', icon: Clock },
};

const TIMEZONES = [
  { id: 'UTC', name: 'UTC / GMT' },
  { id: 'America/New_York', name: 'New York (EST/EDT)' },
  { id: 'America/Chicago', name: 'Chicago (CST/CDT)' },
  { id: 'America/Denver', name: 'Denver (MST/MDT)' },
  { id: 'America/Los_Angeles', name: 'Los Angeles (PST/PDT)' },
  { id: 'Europe/London', name: 'London (GMT/BST)' },
  { id: 'Europe/Paris', name: 'Paris (CET/CEST)' },
  { id: 'Europe/Berlin', name: 'Berlin (CET/CEST)' },
  { id: 'Asia/Tokyo', name: 'Tokyo (JST)' },
  { id: 'Australia/Sydney', name: 'Sydney (AEST/AEDT)' },
  { id: 'Asia/Dubai', name: 'Dubai (GST)' },
  { id: 'Asia/Singapore', name: 'Singapore (SGT)' },
  { id: 'Asia/Kolkata', name: 'India (IST)' },
];

const LENGTH_UNITS = [
  { id: 'mm', name: 'Millimeters', factor: 0.001 },
  { id: 'cm', name: 'Centimeters', factor: 0.01 },
  { id: 'm', name: 'Meters', factor: 1 },
  { id: 'km', name: 'Kilometers', factor: 1000 },
  { id: 'in', name: 'Inches', factor: 0.0254 },
  { id: 'ft', name: 'Feet', factor: 0.3048 },
  { id: 'yd', name: 'Yards', factor: 0.9144 },
  { id: 'mi', name: 'Miles', factor: 1609.344 },
];

const WEIGHT_UNITS = [
  { id: 'mg', name: 'Milligrams', factor: 0.000001 },
  { id: 'g', name: 'Grams', factor: 0.001 },
  { id: 'kg', name: 'Kilograms', factor: 1 },
  { id: 'oz', name: 'Ounces', factor: 0.0283495 },
  { id: 'lb', name: 'Pounds', factor: 0.453592 },
  { id: 'st', name: 'Stones', factor: 6.35029 },
];

const SPEED_UNITS = [
  { id: 'm/s', name: 'Meters / second', factor: 1 },
  { id: 'km/h', name: 'Kilometers / hour', factor: 0.27777777777778 },
  { id: 'mph', name: 'Miles / hour', factor: 0.44704 },
  { id: 'knots', name: 'Knots', factor: 0.51444444444444 },
  { id: 'ft/s', name: 'Feet / second', factor: 0.3048 },
];

const TEMPERATURE_UNITS = [
  { id: 'C', name: 'Celsius', factor: 1 },
  { id: 'F', name: 'Fahrenheit', factor: 1 },
  { id: 'K', name: 'Kelvin', factor: 1 },
];

const SHOE_SIZES = [
  { eu: 35, usM: 3.5, usW: 5, uk: 2.5 },
  { eu: 35.5, usM: 4, usW: 5.5, uk: 3 },
  { eu: 36, usM: 4.5, usW: 6, uk: 3.5 },
  { eu: 37, usM: 5, usW: 6.5, uk: 4 },
  { eu: 37.5, usM: 5.5, usW: 7, uk: 4.5 },
  { eu: 38, usM: 6, usW: 7.5, uk: 5 },
  { eu: 38.5, usM: 6.5, usW: 8, uk: 5.5 },
  { eu: 39, usM: 7, usW: 8.5, uk: 6 },
  { eu: 40, usM: 7.5, usW: 9, uk: 6.5 },
  { eu: 40.5, usM: 8, usW: 9.5, uk: 7 },
  { eu: 41, usM: 8.5, usW: 10, uk: 7.5 },
  { eu: 42, usM: 9, usW: 10.5, uk: 8 },
  { eu: 42.5, usM: 9.5, usW: 11, uk: 8.5 },
  { eu: 43, usM: 10, usW: 11.5, uk: 9 },
  { eu: 44, usM: 10.5, usW: 12, uk: 9.5 },
  { eu: 44.5, usM: 11, usW: 12.5, uk: 10 },
  { eu: 45, usM: 11.5, usW: 13, uk: 10.5 },
  { eu: 46, usM: 12, usW: 13.5, uk: 11 },
  { eu: 46.5, usM: 12.5, usW: 14, uk: 11.5 },
  { eu: 47, usM: 13, usW: 14.5, uk: 12 },
  { eu: 48, usM: 14, usW: 15.5, uk: 13 },
];

export default function App() {
  const [pinnedTabs, setPinnedTabs] = useState<Tab[]>(() => {
    const saved = localStorage.getItem('pinned_tabs');
    return saved ? JSON.parse(saved) : ['currency', 'calculator', 'units', 'percentage', 'timezone'];
  });
  const [activeTab, setActiveTab] = useState<Tab>(() => (localStorage.getItem('active_tab') as Tab) || 'currency');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const [activeCurrencies, setActiveCurrencies] = useState<Currency[]>(() => {
    const saved = localStorage.getItem('active_currencies');
    return saved ? JSON.parse(saved) : SUPPORTED_CURRENCIES.slice(0, 5);
  });
  const [activeCurrency, setActiveCurrency] = useState<Currency>(activeCurrencies[0]);
  const [rates, setRates] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('currency_rates_cache');
    return saved ? JSON.parse(saved) : {};
  });
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    SUPPORTED_CURRENCIES.forEach(c => initial[c.code] = 0);
    const savedRates = localStorage.getItem('currency_rates_cache');
    const savedInput = localStorage.getItem('converter_input');
    const baseVal = savedInput ? parseFloat(savedInput) : 0;
    
    if (savedRates) {
      const r = JSON.parse(savedRates);
      SUPPORTED_CURRENCIES.forEach(c => {
        if (r[c.code]) {
          initial[c.code] = baseVal * (r[c.code] / (r['USD'] || 1));
        }
      });
    } else {
      initial['USD'] = baseVal;
    }
    return initial;
  });
  const [inputString, setInputString] = useState(() => localStorage.getItem('converter_input') || '0');
  const [loading, setLoading] = useState(() => !localStorage.getItem('currency_rates_cache'));
  const [currencyModal, setCurrencyModal] = useState<{ mode: 'swap', index: number } | { mode: 'add' } | null>(null);
  const [timezoneModal, setTimezoneModal] = useState<'from' | 'to' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(() => localStorage.getItem('currency_rates_timestamp'));

  // Calculator State
  const [calcExpression, setCalcExpression] = useState(() => localStorage.getItem('calc_expression') || '');
  const [calcResult, setCalcResult] = useState<string | null>(() => localStorage.getItem('calc_result'));
  const [calcHistory, setCalcHistory] = useState<{ expression: string, result: string }[]>(() => {
    const saved = localStorage.getItem('calc_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [isNewCalc, setIsNewCalc] = useState(() => localStorage.getItem('calc_is_new') === 'true');

  // Kite Calculator State
  const [kiteWeight, setKiteWeight] = useState(() => Number(localStorage.getItem('kite_weight')) || 75);
  const [kiteWind, setKiteWind] = useState(() => Number(localStorage.getItem('kite_wind')) || 20);
  const [kiteBoardLength, setKiteBoardLength] = useState(() => Number(localStorage.getItem('kite_board_length')) || 138);
  const [kiteBoardWidth, setKiteBoardWidth] = useState(() => Number(localStorage.getItem('kite_board_width')) || 41);

  // Units State
  const [unitCategory, setUnitCategory] = useState<'length' | 'weight' | 'speed' | 'temperature'>(() => (localStorage.getItem('unit_category') as 'length' | 'weight' | 'speed' | 'temperature') || 'length');
  const [unitFrom, setUnitFrom] = useState(() => localStorage.getItem('unit_from') || 'm');
  const [unitTo, setUnitTo] = useState(() => localStorage.getItem('unit_to') || 'ft');
  const [unitInput, setUnitInput] = useState(() => localStorage.getItem('unit_input') || '1');

  // Percentage State
  const [percentMode, setPercentMode] = useState<'percentOf' | 'percentChange' | 'isWhatPercent'>(() => (localStorage.getItem('percent_mode') as any) || 'percentOf');
  const [percentVal1, setPercentVal1] = useState(() => localStorage.getItem('percent_val1') || '');
  const [percentVal2, setPercentVal2] = useState(() => localStorage.getItem('percent_val2') || '');
  const [activePercentField, setActivePercentField] = useState<'val1' | 'val2'>('val1');

  // Shoe Size State
  const [shoeSizeSystem, setShoeSizeSystem] = useState<'eu' | 'usM' | 'usW' | 'uk'>(() => (localStorage.getItem('shoe_system') as any) || 'eu');
  const [shoeSizeInput, setShoeSizeInput] = useState(() => localStorage.getItem('shoe_input') || '42');

  // Timezone State
  const [tzFrom, setTzFrom] = useState(() => localStorage.getItem('tz_from') || 'UTC');
  const [tzTo, setTzTo] = useState(() => localStorage.getItem('tz_to') || 'America/New_York');
  const [timeInput, setTimeInput] = useState(() => localStorage.getItem('tz_input') || '1200');

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
      if (isIOS && !isStandalone) {
        setShowIOSPrompt(true);
      } else {
        alert("App is already installed or your browser doesn't support automatic installation.");
      }
    }
  };

  const calculateKiteSize = () => {
    // Base formula: (Weight / Wind) * 2.5
    const baseSize = (kiteWeight / kiteWind) * 2.5;

    // Standard board area for this weight: roughly Weight * 75
    const standardArea = kiteWeight * 75;
    const actualArea = kiteBoardLength * kiteBoardWidth;

    // Dampen the effect so a massive board doesn't drastically change the kite size
    const areaRatio = standardArea / actualArea;
    const dampenedFactor = Math.pow(areaRatio, 0.4);

    const finalSize = baseSize * dampenedFactor;

    return {
      ideal: finalSize.toFixed(1),
      min: (finalSize * 0.9).toFixed(1),
      max: (finalSize * 1.1).toFixed(1)
    };
  };

  const kiteSize = calculateKiteSize();

  useEffect(() => {
    localStorage.setItem('pinned_tabs', JSON.stringify(pinnedTabs));
  }, [pinnedTabs]);

  useEffect(() => {
    localStorage.setItem('active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('active_currencies', JSON.stringify(activeCurrencies));
  }, [activeCurrencies]);

  useEffect(() => {
    localStorage.setItem('calc_history', JSON.stringify(calcHistory));
  }, [calcHistory]);

  useEffect(() => {
    localStorage.setItem('converter_input', inputString);
  }, [inputString]);

  useEffect(() => {
    localStorage.setItem('calc_expression', calcExpression);
  }, [calcExpression]);

  useEffect(() => {
    if (calcResult !== null) {
      localStorage.setItem('calc_result', calcResult);
    } else {
      localStorage.removeItem('calc_result');
    }
  }, [calcResult]);

  useEffect(() => {
    localStorage.setItem('calc_is_new', isNewCalc.toString());
  }, [isNewCalc]);

  useEffect(() => {
    localStorage.setItem('kite_weight', kiteWeight.toString());
    localStorage.setItem('kite_wind', kiteWind.toString());
    localStorage.setItem('kite_board_length', kiteBoardLength.toString());
    localStorage.setItem('kite_board_width', kiteBoardWidth.toString());
  }, [kiteWeight, kiteWind, kiteBoardLength, kiteBoardWidth]);

  useEffect(() => {
    localStorage.setItem('unit_category', unitCategory);
    localStorage.setItem('unit_from', unitFrom);
    localStorage.setItem('unit_to', unitTo);
    localStorage.setItem('unit_input', unitInput);
  }, [unitCategory, unitFrom, unitTo, unitInput]);

  useEffect(() => {
    localStorage.setItem('percent_mode', percentMode);
    localStorage.setItem('percent_val1', percentVal1);
    localStorage.setItem('percent_val2', percentVal2);
  }, [percentMode, percentVal1, percentVal2]);

  useEffect(() => {
    localStorage.setItem('shoe_system', shoeSizeSystem);
    localStorage.setItem('shoe_input', shoeSizeInput);
  }, [shoeSizeSystem, shoeSizeInput]);

  useEffect(() => {
    localStorage.setItem('tz_from', tzFrom);
    localStorage.setItem('tz_to', tzTo);
    localStorage.setItem('tz_input', timeInput);
  }, [tzFrom, tzTo, timeInput]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  useEffect(() => {
    async function loadRates() {
      const newRates = await fetchExchangeRates();
      setRates(newRates);
      setLastUpdated(localStorage.getItem('currency_rates_timestamp'));
      
      const baseVal = parseFloat(inputString) || 1240;
      const newValues: Record<string, number> = { ...values };
      SUPPORTED_CURRENCIES.forEach(c => {
        if (newRates[c.code]) {
          newValues[c.code] = baseVal * (newRates[c.code] / (newRates[activeCurrency.code] || 1));
        }
      });
      setValues(newValues);
      setLoading(false);
    }
    loadRates();
  }, []);

  const updateAllValues = (newVal: number, code: string) => {
    const newValues: Record<string, number> = { ...values };
    newValues[code] = newVal;
    SUPPORTED_CURRENCIES.forEach(c => {
      if (c.code !== code && rates[code] && rates[c.code]) {
        newValues[c.code] = newVal * (rates[c.code] / rates[code]);
      }
    });
    setValues(newValues);
  };

  const handleKeyPress = (key: string) => {
    if (activeTab === 'currency') {
      let nextInput = inputString;
      if (key === 'C') {
        nextInput = '0';
      } else if (key === 'backspace') {
        nextInput = inputString.length > 1 ? inputString.slice(0, -1) : '0';
      } else if (key === '.') {
        if (inputString.includes('.')) return;
        nextInput = inputString + '.';
      } else {
        if (inputString === '0') {
          nextInput = key;
        } else {
          if (inputString.replace('.', '').length >= 10) return;
          nextInput = inputString + key;
        }
      }
      setInputString(nextInput);
      const num = parseFloat(nextInput);
      if (!isNaN(num)) {
        updateAllValues(num, activeCurrency.code);
      }
    } else if (activeTab === 'units') {
      let nextInput = unitInput;
      if (key === 'C') {
        nextInput = '0';
      } else if (key === 'backspace') {
        nextInput = unitInput.length > 1 ? unitInput.slice(0, -1) : '0';
      } else if (key === '.') {
        if (unitInput.includes('.')) return;
        nextInput = unitInput + '.';
      } else if (key === '-') {
        if (unitInput.startsWith('-')) {
          nextInput = unitInput.slice(1) || '0';
        } else {
          nextInput = '-' + (unitInput === '0' ? '' : unitInput);
        }
      } else if (['+', '×', '÷', '(', ')', '='].includes(key)) {
        return;
      } else {
        if (unitInput === '0' || unitInput === '-0') {
          nextInput = unitInput.replace('0', '') + key;
        } else {
          if (unitInput.replace('.', '').replace('-', '').length >= 10) return;
          nextInput = unitInput + key;
        }
      }
      setUnitInput(nextInput);
    } else if (activeTab === 'percentage') {
      const currentVal = activePercentField === 'val1' ? percentVal1 : percentVal2;
      let nextInput = currentVal;
      if (key === 'C') {
        nextInput = '0';
      } else if (key === 'backspace') {
        nextInput = currentVal.length > 1 ? currentVal.slice(0, -1) : '0';
      } else if (key === '.') {
        if (currentVal.includes('.')) return;
        nextInput = currentVal + '.';
      } else if (key === '-') {
        if (currentVal.startsWith('-')) {
          nextInput = currentVal.slice(1) || '0';
        } else {
          nextInput = '-' + (currentVal === '0' ? '' : currentVal);
        }
      } else if (['+', '×', '÷', '(', ')', '='].includes(key)) {
        return;
      } else {
        if (currentVal === '0' || currentVal === '-0' || currentVal === '') {
          nextInput = currentVal.replace('0', '') + key;
        } else {
          if (currentVal.replace('.', '').replace('-', '').length >= 10) return;
          nextInput = currentVal + key;
        }
      }
      if (activePercentField === 'val1') {
        setPercentVal1(nextInput);
      } else {
        setPercentVal2(nextInput);
      }
    } else if (activeTab === 'shoesize') {
      let nextInput = shoeSizeInput;
      if (key === 'C') {
        nextInput = '0';
      } else if (key === 'backspace') {
        nextInput = shoeSizeInput.length > 1 ? shoeSizeInput.slice(0, -1) : '0';
      } else if (key === '.') {
        if (shoeSizeInput.includes('.')) return;
        nextInput = shoeSizeInput + '.';
      } else if (['+', '-', '×', '÷', '(', ')', '='].includes(key)) {
        return;
      } else {
        if (shoeSizeInput === '0') {
          nextInput = key;
        } else {
          if (shoeSizeInput.replace('.', '').length >= 4) return;
          nextInput = shoeSizeInput + key;
        }
      }
      setShoeSizeInput(nextInput);
    } else if (activeTab === 'timezone') {
      let nextInput = timeInput;
      if (key === 'C') {
        nextInput = '';
      } else if (key === 'backspace') {
        nextInput = timeInput.slice(0, -1);
      } else if (['+', '-', '×', '÷', '(', ')', '=', '.'].includes(key)) {
        return;
      } else {
        const numKey = parseInt(key);
        if (timeInput.length === 0 && numKey > 2) return;
        if (timeInput.length === 1 && timeInput[0] === '2' && numKey > 3) return;
        if (timeInput.length === 2 && numKey > 5) return;
        if (timeInput.length >= 4) return;
        nextInput = timeInput + key;
      }
      setTimeInput(nextInput);
    } else if (activeTab === 'calculator') {
      // Calculator logic
      const operators = ['+', '-', '×', '÷'];
      
      if (key === 'C') {
        setCalcExpression('');
        setCalcResult(null);
        setIsNewCalc(false);
      } else if (key === 'backspace') {
        setCalcExpression(prev => prev.slice(0, -1));
        setIsNewCalc(false);
      } else if (key === '=') {
        if (!calcExpression) return;
        try {
          // Remove trailing operator if exists
          let expr = calcExpression;
          if (operators.includes(expr.slice(-1))) {
            expr = expr.slice(0, -1);
          }
          
          const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');
          const result = Function(`'use strict'; return (${sanitized})`)();
          
          if (result === Infinity || isNaN(result)) {
            setCalcResult('Error');
            return;
          }

          const resultStr = Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/\.?0+$/, '');
          setCalcResult(resultStr);
          setCalcHistory(prev => [{ expression: expr, result: resultStr }, ...prev].slice(0, 20));
          setCalcExpression(resultStr);
          setIsNewCalc(true);
        } catch (e) {
          setCalcResult('Error');
        }
      } else {
        const isOperator = operators.includes(key);
        const lastChar = calcExpression.slice(-1);
        const isLastCharOperator = operators.includes(lastChar);

        if (isNewCalc) {
          if (isOperator) {
            setCalcExpression(prev => prev + key);
          } else {
            setCalcExpression(key);
            setCalcResult(null);
          }
        } else if (isOperator && isLastCharOperator) {
          // Replace operator
          setCalcExpression(prev => prev.slice(0, -1) + key);
        } else if (isOperator && !calcExpression) {
          // Don't start with operator (except minus)
          if (key === '-') setCalcExpression(key);
          return;
        } else {
          setCalcExpression(prev => prev + key);
        }
        setIsNewCalc(false);
      }
    }
  };

  const handleCurrencySelect = (currency: Currency) => {
    setActiveCurrency(currency);
    const currentVal = values[currency.code] || 0;
    setInputString(currentVal.toFixed(2).replace(/\.00$/, ''));
  };

  const handleCurrencySelectFromModal = (newCurrency: Currency) => {
    if (!currencyModal) return;
    
    const nextList = [...activeCurrencies];
    
    if (currencyModal.mode === 'swap') {
      nextList[currencyModal.index] = newCurrency;
      setActiveCurrencies(nextList);
      if (activeCurrency.code === activeCurrencies[currencyModal.index].code) {
        setActiveCurrency(newCurrency);
      }
    } else if (currencyModal.mode === 'add') {
      if (!nextList.find(c => c.code === newCurrency.code)) {
        nextList.push(newCurrency);
        setActiveCurrencies(nextList);
      }
    }
    
    setCurrencyModal(null);
    setSearchQuery('');
  };

  const removeCurrency = (code: string) => {
    if (activeCurrencies.length <= 1) return; // Don't remove the last one
    const nextList = activeCurrencies.filter(c => c.code !== code);
    setActiveCurrencies(nextList);
    if (activeCurrency.code === code) {
      setActiveCurrency(nextList[0]);
    }
  };

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(c => 
    (c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
     c.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (currencyModal?.mode === 'add' ? !activeCurrencies.find(ac => ac.code === c.code) : true)
  );

  const filteredTimezones = TIMEZONES.filter(tz => 
    tz.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tz.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateUnitResult = () => {
    const val = parseFloat(unitInput);
    if (isNaN(val)) return '0';

    if (unitCategory === 'temperature') {
      let celsiusVal = val;
      if (unitFrom === 'F') celsiusVal = (val - 32) * 5/9;
      else if (unitFrom === 'K') celsiusVal = val - 273.15;

      let result = celsiusVal;
      if (unitTo === 'F') result = (celsiusVal * 9/5) + 32;
      else if (unitTo === 'K') result = celsiusVal + 273.15;

      return parseFloat(result.toFixed(6)).toString();
    }

    const list = unitCategory === 'length' ? LENGTH_UNITS : unitCategory === 'weight' ? WEIGHT_UNITS : SPEED_UNITS;
    const fromUnitObj = list.find(u => u.id === unitFrom) || list[0];
    const toUnitObj = list.find(u => u.id === unitTo) || list[1];
    
    const baseVal = val * fromUnitObj.factor;
    const result = baseVal / toUnitObj.factor;
    
    return parseFloat(result.toFixed(6)).toString();
  };

  const calculatePercentageResult = () => {
    const v1 = parseFloat(percentVal1);
    const v2 = parseFloat(percentVal2);
    if (isNaN(v1) || isNaN(v2)) return '0';

    if (percentMode === 'percentOf') {
      return parseFloat(((v1 / 100) * v2).toFixed(4)).toString();
    } else if (percentMode === 'percentChange') {
      if (v1 === 0) return '0';
      const change = ((v2 - v1) / Math.abs(v1)) * 100;
      return (change > 0 ? '+' : '') + parseFloat(change.toFixed(4)).toString() + '%';
    } else if (percentMode === 'isWhatPercent') {
      if (v2 === 0) return '0';
      return parseFloat(((v1 / v2) * 100).toFixed(4)).toString() + '%';
    }
    return '0';
  };

  const calculateTimezoneResult = () => {
    if (timeInput.length < 4) return { time: '-- : --', dayOffset: 0 };
    const hh = parseInt(timeInput.slice(0, 2));
    const mm = parseInt(timeInput.slice(2, 4));
    
    const getOffset = (timeZone: string) => {
      const date = new Date();
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
      return (tzDate.getTime() - utcDate.getTime()) / 60000;
    };
    
    const offsetFrom = getOffset(tzFrom);
    const offsetTo = getOffset(tzTo);
    const diffMinutes = offsetTo - offsetFrom;
    
    const totalMinutes = (hh * 60) + mm + diffMinutes;
    const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
    const dayOffset = Math.floor(totalMinutes / 1440);
    
    const finalHH = Math.floor(normalizedMinutes / 60).toString().padStart(2, '0');
    const finalMM = (normalizedMinutes % 60).toString().padStart(2, '0');
    
    return { time: `${finalHH} : ${finalMM}`, dayOffset };
  };

  const formatTimeInput = (input: string) => {
    const padded = input.padEnd(4, '_');
    return `${padded.slice(0,2)} : ${padded.slice(2,4)}`;
  };

  const formattedTime = lastUpdated ? new Date(parseInt(lastUpdated)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="flex flex-col h-[100dvh] bg-surface text-on-surface select-none overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-1 shrink-0 gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xs uppercase tracking-[0.15em] font-black text-primary leading-none truncate">PAAGulator</h1>
          <p className="text-[8px] text-outline font-bold mt-0.5 uppercase tracking-wider opacity-60 truncate">Build {typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'Dev'} • {formattedTime}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab('calculator')} 
            className="p-2 bg-surface-container-high rounded-full text-outline hover:text-primary active:scale-90 transition-transform shadow-sm"
            title="Calculator"
          >
            <CalcIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className="p-2 bg-surface-container-high rounded-full text-outline hover:text-primary active:scale-90 transition-transform shadow-sm"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => window.location.reload()} className="p-2 bg-surface-container-high rounded-full text-outline hover:text-primary active:scale-90 transition-transform shadow-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="px-4 mb-2 shrink-0">
        <div className="flex p-1.5 bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-inner overflow-x-auto custom-scrollbar">
          {pinnedTabs.map(tabId => {
            const meta = TAB_META[tabId];
            const Icon = meta.icon;
            return (
              <button 
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={cn(
                  "flex-1 min-w-[80px] flex items-center justify-center gap-2 py-3 px-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300",
                  activeTab === tabId ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-outline hover:text-on-surface"
                )}
              >
                <Icon className="w-4 h-4 hidden sm:block" />
                {meta.label}
              </button>
            );
          })}
          <button 
            onClick={() => setIsMoreMenuOpen(true)}
            className="flex-1 min-w-[60px] max-w-[60px] flex items-center justify-center gap-2 py-3 px-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 text-outline hover:text-on-surface hover:bg-surface-container"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'currency' && (
            <motion.div 
              key="currency"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col px-4 pb-2"
            >
              <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                    <RefreshCw className="w-12 h-12 animate-spin text-primary" />
                    <span className="text-xs uppercase tracking-[0.3em] font-black">Syncing Market...</span>
                  </div>
                ) : (
                  <Reorder.Group axis="y" values={activeCurrencies} onReorder={setActiveCurrencies} className="space-y-2">
                    {activeCurrencies.map((currency, index) => {
                      const isActive = activeCurrency.code === currency.code;
                      const val = values[currency.code] || 0;
                      
                      return (
                        <CurrencyItem
                          key={currency.code}
                          currency={currency}
                          isActive={isActive}
                          val={val}
                          inputString={inputString}
                          onSelect={() => handleCurrencySelect(currency)}
                          onSwap={() => setCurrencyModal({ mode: 'swap', index })}
                          onDelete={() => removeCurrency(currency.code)}
                        />
                      );
                    })}
                  </Reorder.Group>
                )}
                
                {!loading && (
                  <button 
                    onClick={() => setCurrencyModal({ mode: 'add' })}
                    className="w-full mt-4 py-4 flex items-center justify-center gap-2 text-outline hover:text-primary hover:bg-primary/5 rounded-2xl border-2 border-dashed border-outline-variant/20 hover:border-primary/30 transition-all active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Add Currency</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
          
          {activeTab === 'calculator' && (
            <motion.div 
              key="calculator"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col px-6 pb-4"
            >
              {/* Calculator Display */}
              <div className="flex-1 flex flex-col justify-end items-end py-6 space-y-4">
                <div className="w-full overflow-y-auto max-h-[40%] custom-scrollbar mb-auto">
                  <div className="flex flex-col items-end space-y-3">
                    <div className="w-full flex justify-between items-center mb-2 px-1">
                      <div className="text-[10px] font-black tracking-[0.2em] text-primary uppercase opacity-80 flex items-center gap-2">
                        <History className="w-3 h-3" />
                        History
                      </div>
                      {calcHistory.length > 0 && (
                        <button 
                          onClick={() => setCalcHistory([])}
                          className="p-1.5 hover:bg-error/10 text-outline hover:text-error rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {calcHistory.map((item, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i} 
                        className="text-right bg-surface-container-low/40 p-2 rounded-xl border border-outline-variant/5 w-full"
                      >
                        <div className="text-xs font-medium text-on-surface/60">{item.expression} =</div>
                        <div className="text-sm font-black text-primary">{item.result}</div>
                      </motion.div>
                    ))}
                    {calcHistory.length === 0 && (
                      <div className="w-full text-center py-8 opacity-20">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em]">No Calculations Yet</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right w-full px-2">
                  <div className="text-outline text-2xl sm:text-3xl font-bold tracking-widest min-h-[2.5rem] break-all opacity-80">
                    {calcExpression || '0'}
                  </div>
                  <div className={cn(
                    "text-6xl sm:text-7xl font-black tracking-tighter mt-2 transition-all duration-500",
                    calcResult ? "text-primary scale-105" : "text-on-surface/20"
                  )}>
                    {calcResult || '0'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'kite' && (
            <motion.div 
              key="kite"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col px-6 pb-4 overflow-y-auto custom-scrollbar"
            >
              <div className="flex-1 flex flex-col space-y-6 py-4">
                <div className="text-center mb-2">
                  <div className="text-[10px] font-black tracking-[0.2em] text-primary uppercase opacity-80 mb-2">Recommended Kite</div>
                  <div className="text-6xl sm:text-7xl font-black tracking-tighter text-primary">
                    {kiteSize.ideal}<span className="text-2xl sm:text-3xl text-outline ml-1">m²</span>
                  </div>
                  <div className="text-sm font-bold text-outline mt-2">
                    Range: {kiteSize.min} - {kiteSize.max} m²
                  </div>
                </div>

                <div className="space-y-6 bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 shadow-inner">
                  {/* Weight Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <label className="text-xs font-black uppercase tracking-widest text-outline">Rider Weight</label>
                      <span className="text-lg font-bold text-primary">{kiteWeight} kg</span>
                    </div>
                    <input 
                      type="range" 
                      min="40" max="120" 
                      value={kiteWeight} 
                      onChange={(e) => setKiteWeight(Number(e.target.value))}
                      className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Wind Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <label className="text-xs font-black uppercase tracking-widest text-outline">Wind Speed</label>
                      <span className="text-lg font-bold text-primary">{kiteWind} knots</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" max="40" 
                      value={kiteWind} 
                      onChange={(e) => setKiteWind(Number(e.target.value))}
                      className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Board Length Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <label className="text-xs font-black uppercase tracking-widest text-outline">Board Length</label>
                      <span className="text-lg font-bold text-primary">{kiteBoardLength} cm</span>
                    </div>
                    <input 
                      type="range" 
                      min="120" max="170" 
                      value={kiteBoardLength} 
                      onChange={(e) => setKiteBoardLength(Number(e.target.value))}
                      className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Board Width Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <label className="text-xs font-black uppercase tracking-widest text-outline">Board Width</label>
                      <span className="text-lg font-bold text-primary">{kiteBoardWidth} cm</span>
                    </div>
                    <input 
                      type="range" 
                      min="35" max="50" 
                      value={kiteBoardWidth} 
                      onChange={(e) => setKiteBoardWidth(Number(e.target.value))}
                      className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'units' && (
            <motion.div 
              key="units"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col px-6 pb-4 overflow-y-auto custom-scrollbar"
            >
              <div className="flex-1 flex flex-col space-y-6 py-4">
                {/* Category Switcher */}
                <div className="flex p-1.5 bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-inner">
                  <button 
                    onClick={() => {
                      setUnitCategory('length');
                      setUnitFrom('m');
                      setUnitTo('ft');
                    }}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300",
                      unitCategory === 'length' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-outline hover:text-on-surface"
                    )}
                  >
                    Length
                  </button>
                  <button 
                    onClick={() => {
                      setUnitCategory('weight');
                      setUnitFrom('kg');
                      setUnitTo('lb');
                    }}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300",
                      unitCategory === 'weight' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-outline hover:text-on-surface"
                    )}
                  >
                    Weight
                  </button>
                  <button 
                    onClick={() => {
                      setUnitCategory('speed');
                      setUnitFrom('km/h');
                      setUnitTo('mph');
                    }}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300",
                      unitCategory === 'speed' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-outline hover:text-on-surface"
                    )}
                  >
                    Speed
                  </button>
                  <button 
                    onClick={() => {
                      setUnitCategory('temperature');
                      setUnitFrom('C');
                      setUnitTo('F');
                    }}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300",
                      unitCategory === 'temperature' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-outline hover:text-on-surface"
                    )}
                  >
                    Temp
                  </button>
                </div>

                <div className="space-y-4 bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 shadow-inner">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline">From</label>
                    <div className="flex gap-3">
                      <div 
                        className="flex-1 bg-surface-container-highest rounded-xl px-4 py-3 text-2xl sm:text-3xl font-black tracking-tighter text-primary outline-none ring-2 ring-primary/50 transition-all flex items-center overflow-hidden"
                      >
                        <span className="truncate">{unitInput || '0'}</span>
                        <motion.div 
                          animate={{ opacity: [1, 0] }} 
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          className="w-0.5 h-6 sm:h-8 bg-primary ml-1"
                        />
                      </div>
                      <select 
                        value={unitFrom}
                        onChange={(e) => setUnitFrom(e.target.value)}
                        className="w-1/2 bg-surface-container-highest rounded-xl px-4 py-3 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                      >
                        {(unitCategory === 'length' ? LENGTH_UNITS : unitCategory === 'weight' ? WEIGHT_UNITS : unitCategory === 'speed' ? SPEED_UNITS : TEMPERATURE_UNITS).map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.id})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-center -my-2 relative z-10">
                    <button 
                      onClick={() => {
                        const temp = unitFrom;
                        setUnitFrom(unitTo);
                        setUnitTo(temp);
                      }}
                      className="p-2 bg-surface-container-highest rounded-full text-primary hover:bg-primary/10 active:scale-90 transition-all shadow-md border border-outline-variant/20"
                    >
                      <ArrowUpDown className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline">To</label>
                    <select 
                      value={unitTo}
                      onChange={(e) => setUnitTo(e.target.value)}
                      className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                    >
                      {(unitCategory === 'length' ? LENGTH_UNITS : unitCategory === 'weight' ? WEIGHT_UNITS : unitCategory === 'speed' ? SPEED_UNITS : TEMPERATURE_UNITS).map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.id})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <div className="text-[10px] font-black tracking-[0.2em] text-primary uppercase opacity-80 mb-2">Result</div>
                  <div className="text-5xl sm:text-6xl font-black tracking-tighter text-primary break-all">
                    {calculateUnitResult()}
                    <span className="text-2xl sm:text-3xl text-outline ml-2">{unitTo}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'percentage' && (
            <motion.div 
              key="percentage"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col px-6 pb-4 overflow-y-auto custom-scrollbar"
            >
              <div className="flex-1 flex flex-col space-y-6 py-4">
                {/* Mode Switcher */}
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setPercentMode('percentOf')}
                    className={cn(
                      "w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 text-left leading-relaxed",
                      percentMode === 'percentOf' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "bg-surface-container-low text-outline hover:text-on-surface border border-outline-variant/10"
                    )}
                  >
                    WHAT IS <span className={cn("inline-block mx-0.5 px-1.5 py-0.5 rounded leading-none", percentMode === 'percentOf' ? "bg-surface text-blue-500 dark:text-blue-400 shadow-sm" : "text-blue-500 dark:text-blue-400 bg-blue-500/10")}>X</span>% OF <span className={cn("inline-block mx-0.5 px-1.5 py-0.5 rounded leading-none", percentMode === 'percentOf' ? "bg-surface text-rose-500 dark:text-rose-400 shadow-sm" : "text-rose-500 dark:text-rose-400 bg-rose-500/10")}>Y</span>?
                  </button>
                  <button 
                    onClick={() => setPercentMode('isWhatPercent')}
                    className={cn(
                      "w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 text-left leading-relaxed",
                      percentMode === 'isWhatPercent' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "bg-surface-container-low text-outline hover:text-on-surface border border-outline-variant/10"
                    )}
                  >
                    <span className={cn("inline-block mr-0.5 px-1.5 py-0.5 rounded leading-none", percentMode === 'isWhatPercent' ? "bg-surface text-blue-500 dark:text-blue-400 shadow-sm" : "text-blue-500 dark:text-blue-400 bg-blue-500/10")}>X</span> IS WHAT % OF <span className={cn("inline-block mx-0.5 px-1.5 py-0.5 rounded leading-none", percentMode === 'isWhatPercent' ? "bg-surface text-rose-500 dark:text-rose-400 shadow-sm" : "text-rose-500 dark:text-rose-400 bg-rose-500/10")}>Y</span>?
                  </button>
                  <button 
                    onClick={() => setPercentMode('percentChange')}
                    className={cn(
                      "w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 text-left leading-relaxed",
                      percentMode === 'percentChange' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "bg-surface-container-low text-outline hover:text-on-surface border border-outline-variant/10"
                    )}
                  >
                    % CHANGE FROM <span className={cn("inline-block mx-0.5 px-1.5 py-0.5 rounded leading-none", percentMode === 'percentChange' ? "bg-surface text-blue-500 dark:text-blue-400 shadow-sm" : "text-blue-500 dark:text-blue-400 bg-blue-500/10")}>X</span> TO <span className={cn("inline-block mx-0.5 px-1.5 py-0.5 rounded leading-none", percentMode === 'percentChange' ? "bg-surface text-rose-500 dark:text-rose-400 shadow-sm" : "text-rose-500 dark:text-rose-400 bg-rose-500/10")}>Y</span>
                  </button>
                </div>

                <div className="space-y-4 bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 shadow-inner">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline flex items-center gap-1.5">
                      VALUE <span className="text-blue-500 dark:text-blue-400 text-[12px] bg-blue-500/10 px-1.5 py-0.5 rounded leading-none">X</span>
                    </label>
                    <div 
                      onClick={() => setActivePercentField('val1')}
                      className={cn(
                        "w-full bg-surface-container-highest rounded-xl px-4 py-3 text-2xl sm:text-3xl font-black tracking-tighter outline-none transition-all flex items-center overflow-hidden cursor-pointer",
                        activePercentField === 'val1' ? "text-primary ring-2 ring-primary/50" : "text-on-surface/60 border border-outline-variant/20"
                      )}
                    >
                      <span className="truncate">{percentVal1 || '0'}</span>
                      {activePercentField === 'val1' && (
                        <motion.div 
                          animate={{ opacity: [1, 0] }} 
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          className="w-0.5 h-6 sm:h-8 bg-primary ml-1"
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline flex items-center gap-1.5">
                      VALUE <span className="text-rose-500 dark:text-rose-400 text-[12px] bg-rose-500/10 px-1.5 py-0.5 rounded leading-none">Y</span>
                    </label>
                    <div 
                      onClick={() => setActivePercentField('val2')}
                      className={cn(
                        "w-full bg-surface-container-highest rounded-xl px-4 py-3 text-2xl sm:text-3xl font-black tracking-tighter outline-none transition-all flex items-center overflow-hidden cursor-pointer",
                        activePercentField === 'val2' ? "text-primary ring-2 ring-primary/50" : "text-on-surface/60 border border-outline-variant/20"
                      )}
                    >
                      <span className="truncate">{percentVal2 || '0'}</span>
                      {activePercentField === 'val2' && (
                        <motion.div 
                          animate={{ opacity: [1, 0] }} 
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          className="w-0.5 h-6 sm:h-8 bg-primary ml-1"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <div className="text-[10px] font-black tracking-[0.2em] text-primary uppercase opacity-80 mb-2">Result</div>
                  <div className="text-5xl sm:text-6xl font-black tracking-tighter text-primary break-all">
                    {calculatePercentageResult()}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'shoesize' && (
            <motion.div 
              key="shoesize"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col px-6 pb-4 overflow-y-auto custom-scrollbar"
            >
              <div className="flex-1 flex flex-col space-y-6 py-4">
                <div className="flex p-1.5 bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-inner overflow-x-auto custom-scrollbar">
                  <button 
                    onClick={() => setShoeSizeSystem('eu')}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300",
                      shoeSizeSystem === 'eu' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-outline hover:text-on-surface"
                    )}
                  >
                    EU
                  </button>
                  <button 
                    onClick={() => setShoeSizeSystem('usM')}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300",
                      shoeSizeSystem === 'usM' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-outline hover:text-on-surface"
                    )}
                  >
                    US (M)
                  </button>
                  <button 
                    onClick={() => setShoeSizeSystem('usW')}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300",
                      shoeSizeSystem === 'usW' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-outline hover:text-on-surface"
                    )}
                  >
                    US (W)
                  </button>
                  <button 
                    onClick={() => setShoeSizeSystem('uk')}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300",
                      shoeSizeSystem === 'uk' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-outline hover:text-on-surface"
                    )}
                  >
                    UK
                  </button>
                </div>

                <div className="space-y-4 bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 shadow-inner">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline">Your Size ({shoeSizeSystem.toUpperCase()})</label>
                    <div className="flex gap-3">
                      <div 
                        className="flex-1 bg-surface-container-highest rounded-xl px-4 py-3 text-2xl sm:text-3xl font-black tracking-tighter text-primary outline-none ring-2 ring-primary/50 transition-all flex items-center overflow-hidden"
                      >
                        <span className="truncate">{shoeSizeInput || '0'}</span>
                        <motion.div 
                          animate={{ opacity: [1, 0] }} 
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          className="w-0.5 h-6 sm:h-8 bg-primary ml-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  {(() => {
                    const inputVal = parseFloat(shoeSizeInput);
                    if (isNaN(inputVal)) return null;
                    
                    // Find closest match
                    let closest = SHOE_SIZES[0];
                    let minDiff = Infinity;
                    for (const size of SHOE_SIZES) {
                      const diff = Math.abs(size[shoeSizeSystem] - inputVal);
                      if (diff < minDiff) {
                        minDiff = diff;
                        closest = size;
                      }
                    }

                    return (
                      <div className="grid grid-cols-2 gap-4">
                        {shoeSizeSystem !== 'eu' && (
                          <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10 text-center">
                            <div className="text-[10px] font-black tracking-[0.2em] text-outline uppercase mb-1">EU</div>
                            <div className="text-3xl font-black text-primary">{closest.eu}</div>
                          </div>
                        )}
                        {shoeSizeSystem !== 'usM' && (
                          <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10 text-center">
                            <div className="text-[10px] font-black tracking-[0.2em] text-outline uppercase mb-1">US (Men)</div>
                            <div className="text-3xl font-black text-primary">{closest.usM}</div>
                          </div>
                        )}
                        {shoeSizeSystem !== 'usW' && (
                          <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10 text-center">
                            <div className="text-[10px] font-black tracking-[0.2em] text-outline uppercase mb-1">US (Women)</div>
                            <div className="text-3xl font-black text-primary">{closest.usW}</div>
                          </div>
                        )}
                        {shoeSizeSystem !== 'uk' && (
                          <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10 text-center">
                            <div className="text-[10px] font-black tracking-[0.2em] text-outline uppercase mb-1">UK</div>
                            <div className="text-3xl font-black text-primary">{closest.uk}</div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'timezone' && (
            <motion.div 
              key="timezone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col px-6 pb-4 overflow-y-auto custom-scrollbar"
            >
              <div className="flex-1 flex flex-col space-y-6 py-4">
                <div className="space-y-4 bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 shadow-inner">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline">From Timezone</label>
                    <button 
                      onClick={() => {
                        setTimezoneModal('from');
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between bg-surface-container-highest rounded-xl px-4 py-3 text-sm sm:text-base font-bold tracking-wide outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-outline-variant/20 hover:bg-surface-container"
                    >
                      <span className="truncate">{TIMEZONES.find(t => t.id === tzFrom)?.name || tzFrom}</span>
                      <ChevronDown className="w-4 h-4 text-outline shrink-0 ml-2" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline">Time (HH:MM)</label>
                    <div className="flex gap-3">
                      <div 
                        className="flex-1 bg-surface-container-highest rounded-xl px-4 py-3 text-3xl sm:text-4xl font-black tracking-widest text-primary outline-none ring-2 ring-primary/50 transition-all flex items-center justify-center overflow-hidden"
                      >
                        <span>{formatTimeInput(timeInput)}</span>
                        <motion.div 
                          animate={{ opacity: [1, 0] }} 
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          className="w-0.5 h-8 sm:h-10 bg-primary ml-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 shadow-inner">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline">To Timezone</label>
                    <button 
                      onClick={() => {
                        setTimezoneModal('to');
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between bg-surface-container-highest rounded-xl px-4 py-3 text-sm sm:text-base font-bold tracking-wide outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-outline-variant/20 hover:bg-surface-container"
                    >
                      <span className="truncate">{TIMEZONES.find(t => t.id === tzTo)?.name || tzTo}</span>
                      <ChevronDown className="w-4 h-4 text-outline shrink-0 ml-2" />
                    </button>
                  </div>

                  <div className="text-center pt-4">
                    <div className="text-[10px] font-black tracking-[0.2em] text-primary uppercase opacity-80 mb-2">Converted Time</div>
                    <div className="flex items-baseline justify-center gap-2">
                      <div className="text-5xl sm:text-6xl font-black tracking-widest text-primary">
                        {calculateTimezoneResult().time}
                      </div>
                      {calculateTimezoneResult().dayOffset !== 0 && (
                        <div className="text-sm font-bold text-outline uppercase tracking-wider">
                          {calculateTimezoneResult().dayOffset > 0 ? '(+1 Day)' : '(-1 Day)'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Keypad Section */}
      {activeTab !== 'kite' && (
        <div className="bg-surface-container p-3 sm:p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))] rounded-t-3xl border-t border-outline-variant/10 shadow-[0_-15px_50px_rgba(0,0,0,0.4)] relative z-50 shrink-0">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {activeTab === 'currency' ? (
            <>
              {[7, 8, 9].map(n => (
                <KeypadButton key={n} label={n.toString()} onClick={() => handleKeyPress(n.toString())} />
              ))}
              <KeypadButton 
                label={<Delete className="w-7 h-7" />} 
                onClick={() => handleKeyPress('backspace')}
                variant="secondary-tonal"
              />
              
              {[4, 5, 6].map(n => (
                <KeypadButton key={n} label={n.toString()} onClick={() => handleKeyPress(n.toString())} />
              ))}
              <KeypadButton label="C" onClick={() => handleKeyPress('C')} variant="secondary" />

              {[1, 2, 3].map(n => (
                <KeypadButton key={n} label={n.toString()} onClick={() => handleKeyPress(n.toString())} />
              ))}
              <KeypadButton 
                label={<ArrowUpDown className="w-7 h-7" />} 
                onClick={() => {
                  const nextIdx = (activeCurrencies.indexOf(activeCurrency) + 1) % activeCurrencies.length;
                  handleCurrencySelect(activeCurrencies[nextIdx]);
                }} 
                variant="primary" 
                className="row-span-2 h-auto"
              />

              <KeypadButton label="0" onClick={() => handleKeyPress('0')} className="col-span-2" />
              <KeypadButton label="." onClick={() => handleKeyPress('.')} />
            </>
          ) : activeTab === 'units' || activeTab === 'percentage' || activeTab === 'shoesize' || activeTab === 'timezone' ? (
            <>
              {[7, 8, 9].map(n => (
                <KeypadButton key={n} label={n.toString()} onClick={() => handleKeyPress(n.toString())} />
              ))}
              <KeypadButton 
                label={<Delete className="w-7 h-7" />} 
                onClick={() => handleKeyPress('backspace')}
                variant="secondary-tonal"
              />
              
              {[4, 5, 6].map(n => (
                <KeypadButton key={n} label={n.toString()} onClick={() => handleKeyPress(n.toString())} />
              ))}
              <KeypadButton label="C" onClick={() => handleKeyPress('C')} variant="secondary" />

              {[1, 2, 3].map(n => (
                <KeypadButton key={n} label={n.toString()} onClick={() => handleKeyPress(n.toString())} />
              ))}
              <KeypadButton label={<Minus className="w-6 h-6" />} onClick={() => handleKeyPress('-')} variant="secondary-tonal" className="row-span-2 h-auto" />

              <KeypadButton label="0" onClick={() => handleKeyPress('0')} className="col-span-2" />
              <KeypadButton label="." onClick={() => handleKeyPress('.')} />
            </>
          ) : (
            <>
              <KeypadButton label="C" onClick={() => handleKeyPress('C')} variant="secondary" />
              <KeypadButton label="(" onClick={() => handleKeyPress('(')} variant="primary-tonal" />
              <KeypadButton label=")" onClick={() => handleKeyPress(')')} variant="primary-tonal" />
              <KeypadButton 
                label={<Delete className="w-7 h-7" />} 
                onClick={() => handleKeyPress('backspace')}
                variant="secondary-tonal"
              />

              {[7, 8, 9].map(n => (
                <KeypadButton key={n} label={n.toString()} onClick={() => handleKeyPress(n.toString())} />
              ))}
              <KeypadButton label={<Divide className="w-6 h-6" />} onClick={() => handleKeyPress('÷')} variant="primary-tonal" />

              {[4, 5, 6].map(n => (
                <KeypadButton key={n} label={n.toString()} onClick={() => handleKeyPress(n.toString())} />
              ))}
              <KeypadButton label={<X className="w-6 h-6" />} onClick={() => handleKeyPress('×')} variant="primary-tonal" />

              {[1, 2, 3].map(n => (
                <KeypadButton key={n} label={n.toString()} onClick={() => handleKeyPress(n.toString())} />
              ))}
              <KeypadButton label={<Minus className="w-6 h-6" />} onClick={() => handleKeyPress('-')} variant="primary-tonal" />

              <KeypadButton label="0" onClick={() => handleKeyPress('0')} />
              <KeypadButton label="." onClick={() => handleKeyPress('.')} />
              <KeypadButton label={<Equal className="w-6 h-6" />} onClick={() => handleKeyPress('=')} variant="primary" />
              <KeypadButton label={<Plus className="w-6 h-6" />} onClick={() => handleKeyPress('+')} variant="primary-tonal" />
            </>
          )}
        </div>
      </div>
      )}

      {/* Swap/Add Currency Modal */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreMenuOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md bg-surface-container-high rounded-b-[4rem] sm:rounded-[4rem] overflow-hidden shadow-2xl border-b border-x border-outline-variant/30 flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-outline-variant/10">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-primary">
                      More Calculators
                    </h3>
                  </div>
                  <button onClick={() => setIsMoreMenuOpen(false)} className="p-3 bg-surface-container-highest rounded-full active:scale-90 transition-transform border border-outline-variant/20 shadow-lg">
                    <X className="w-7 h-7" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                {(Object.keys(TAB_META) as Tab[]).map(tabId => {
                  const meta = TAB_META[tabId];
                  const Icon = meta.icon;
                  const isPinned = pinnedTabs.includes(tabId);
                  
                  return (
                    <div
                      key={tabId}
                      className="w-full flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container rounded-3xl transition-all border border-transparent hover:border-outline-variant/20"
                    >
                      <button 
                        onClick={() => {
                          setActiveTab(tabId);
                          setIsMoreMenuOpen(false);
                        }}
                        className="flex-1 flex items-center gap-4 text-left"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary shadow-sm border border-outline-variant/10">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="text-base font-black tracking-widest">{meta.label}</div>
                      </button>
                      
                      <button
                        onClick={() => {
                          if (isPinned) {
                            setPinnedTabs(pinnedTabs.filter(t => t !== tabId));
                          } else {
                            setPinnedTabs([...pinnedTabs, tabId]);
                          }
                        }}
                        className={cn(
                          "p-3 rounded-full transition-all border",
                          isPinned 
                            ? "bg-primary/10 text-primary border-primary/20 hover:bg-error/10 hover:text-error hover:border-error/20" 
                            : "bg-surface-container-highest text-outline border-outline-variant/20 hover:text-primary hover:border-primary/30"
                        )}
                        title={isPinned ? "Unpin from main view" : "Pin to main view"}
                      >
                        {isPinned ? <PinOff className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
                      </button>
                    </div>
                  );
                })}
                
                <div className="mt-4 pt-4 border-t border-outline-variant/10">
                  <button
                    onClick={handleInstallClick}
                    className="w-full flex items-center gap-4 p-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-3xl transition-all border border-primary/20"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
                      <Download className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-base font-black tracking-widest">Install App</div>
                      <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider mt-1">Add to Home Screen</div>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* iOS Install Prompt Modal */}
      <AnimatePresence>
        {showIOSPrompt && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIOSPrompt(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="relative w-full max-w-sm bg-surface-container-high rounded-3xl p-6 shadow-2xl border border-outline-variant/20"
            >
              <button 
                onClick={() => setShowIOSPrompt(false)}
                className="absolute top-4 right-4 p-2 text-outline hover:text-on-surface bg-surface-container-highest rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
                  <Share className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-on-surface mb-2">Install on iOS</h3>
                <p className="text-sm text-outline mb-6">
                  To install PAAGulator on your iPhone or iPad:
                </p>
                <ol className="text-left text-sm text-on-surface space-y-4 w-full bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
                  <li className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-xs">1</span>
                    <span>Tap the <strong>Share</strong> button at the bottom of Safari.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-xs">2</span>
                    <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                  </li>
                </ol>
                <button 
                  onClick={() => setShowIOSPrompt(false)}
                  className="mt-6 w-full py-3 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-transform"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Swap/Add Currency Modal */}
      <AnimatePresence>
        {currencyModal !== null && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCurrencyModal(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md bg-surface-container-high rounded-b-[4rem] sm:rounded-[4rem] overflow-hidden shadow-2xl border-b border-x border-outline-variant/30 flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-outline-variant/10">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-primary">
                      {currencyModal.mode === 'add' ? 'Add Currency' : 'Swap Currency'}
                    </h3>
                    {currencyModal.mode === 'swap' && (
                      <p className="text-[10px] text-outline font-black uppercase tracking-[0.25em] mt-2 opacity-60">Replacement for {activeCurrencies[currencyModal.index].code}</p>
                    )}
                  </div>
                  <button onClick={() => setCurrencyModal(null)} className="p-3 bg-surface-container-highest rounded-full active:scale-90 transition-transform border border-outline-variant/20 shadow-lg">
                    <X className="w-7 h-7" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-outline" />
                  <input 
                    type="text" 
                    placeholder="Search by name or code..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-3xl py-5 pl-14 pr-6 text-base font-bold focus:ring-2 focus:ring-primary outline-none placeholder:text-outline/30 shadow-inner"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                {filteredCurrencies.length > 0 ? (
                  filteredCurrencies.map(currency => (
                    <button
                      key={currency.code}
                      onClick={() => handleCurrencySelectFromModal(currency)}
                      className="w-full flex items-center justify-between p-5 hover:bg-primary/10 rounded-[2rem] transition-all group active:scale-[0.98] border border-transparent hover:border-primary/20"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[1.25rem] overflow-hidden border border-outline-variant/20 flex items-center justify-center bg-surface-container-highest shadow-sm">
                          <img src={currency.flagUrl} alt={currency.code} className="w-10 h-auto" referrerPolicy="no-referrer" />
                        </div>
                        <div className="text-left">
                          <div className="text-base font-black group-hover:text-primary transition-colors tracking-widest">{currency.code}</div>
                          <div className="text-[11px] text-outline font-bold leading-none mt-1.5 opacity-80">{currency.name}</div>
                        </div>
                      </div>
                      <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpDown className="w-6 h-6" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-24 text-center opacity-30">
                    <Search className="w-16 h-16 mx-auto mb-6" />
                    <span className="text-xs uppercase tracking-[0.3em] font-black">No currencies found</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Timezone Modal */}
      <AnimatePresence>
        {timezoneModal !== null && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTimezoneModal(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md bg-surface-container-high rounded-b-[4rem] sm:rounded-[4rem] overflow-hidden shadow-2xl border-b border-x border-outline-variant/30 flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-outline-variant/10">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-primary">
                      Select Timezone
                    </h3>
                  </div>
                  <button onClick={() => setTimezoneModal(null)} className="p-3 bg-surface-container-highest rounded-full active:scale-90 transition-transform border border-outline-variant/20 shadow-lg">
                    <X className="w-7 h-7" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-outline" />
                  <input 
                    type="text" 
                    placeholder="Search timezones..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-3xl py-5 pl-14 pr-6 text-base font-bold focus:ring-2 focus:ring-primary outline-none placeholder:text-outline/30 shadow-inner"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                {filteredTimezones.length > 0 ? (
                  filteredTimezones.map(tz => (
                    <button
                      key={tz.id}
                      onClick={() => {
                        if (timezoneModal === 'from') {
                          setTzFrom(tz.id);
                        } else {
                          setTzTo(tz.id);
                        }
                        setTimezoneModal(null);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-5 hover:bg-primary/10 rounded-[2rem] transition-all group active:scale-[0.98] border border-transparent hover:border-primary/20"
                    >
                      <div className="text-left">
                        <div className="text-base font-black group-hover:text-primary transition-colors tracking-widest">{tz.name}</div>
                        <div className="text-[11px] text-outline font-bold leading-none mt-1.5 opacity-80">{tz.id}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-24 text-center opacity-30">
                    <Search className="w-16 h-16 mx-auto mb-6" />
                    <span className="text-xs uppercase tracking-[0.3em] font-black">No timezones found</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KeypadButton({ 
  label, 
  onClick, 
  variant = 'default',
  className
}: { 
  label: React.ReactNode, 
  onClick: () => void, 
  variant?: 'default' | 'primary' | 'secondary' | 'primary-tonal' | 'secondary-tonal',
  className?: string
}) {
  const variants = {
    default: 'bg-surface-container-highest text-on-surface active:bg-primary/20 active:text-primary active:scale-95 shadow-sm border border-outline-variant/5',
    primary: 'bg-primary text-on-primary active:scale-90 shadow-xl shadow-primary/30 bg-gradient-to-br from-primary to-primary-dim',
    secondary: 'bg-secondary text-on-secondary active:scale-90 shadow-xl shadow-secondary/30 bg-gradient-to-br from-secondary to-secondary/80',
    'primary-tonal': 'bg-primary/10 text-primary border border-primary/20 active:scale-95 hover:bg-primary/15',
    'secondary-tonal': 'bg-secondary/10 text-secondary border border-secondary/20 active:scale-95 hover:bg-secondary/15',
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "h-12 sm:h-14 md:h-16 rounded-2xl flex items-center justify-center font-headline text-2xl sm:text-3xl font-black transition-all duration-150",
        variants[variant],
        className
      )}
    >
      {label}
    </button>
  );
}

function CurrencyItem({ 
  currency, 
  isActive, 
  val, 
  inputString, 
  onSelect, 
  onSwap,
  onDelete
}: { 
  currency: Currency, 
  isActive: boolean, 
  val: number, 
  inputString: string, 
  onSelect: () => void, 
  onSwap: () => void,
  onDelete: () => void
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item 
      value={currency}
      dragListener={false}
      dragControls={dragControls}
      className="relative"
    >
      <div className="absolute inset-y-0 right-0 w-full bg-error/20 rounded-2xl flex items-center justify-end pr-6 -z-10">
        <Trash2 className="w-6 h-6 text-error" />
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ right: 0.8, left: 0 }}
        onDragEnd={(e, info) => {
          if (info.offset.x > 100) {
            onDelete();
          }
        }}
        className={cn(
          "relative flex items-center justify-between p-3 rounded-2xl transition-colors duration-500",
          isActive ? "bg-primary/10 ring-1 ring-primary/40 shadow-xl shadow-primary/5" : "bg-surface-container-low hover:bg-surface-container"
        )}
        onClick={onSelect}
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-2 -ml-2 text-outline/40 hover:text-outline cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={(e) => {
              e.stopPropagation();
              dragControls.start(e);
            }}
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onSwap(); }}
            className="relative group active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-outline-variant/30 flex items-center justify-center bg-surface-container-high shadow-md">
              <img 
                src={currency.flagUrl} 
                alt={currency.code} 
                className="w-7 h-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5 border-2 border-surface shadow-lg">
              <ChevronDown className="w-3 h-3 text-on-primary" />
            </div>
          </button>
          <div>
            <div className={cn(
              "text-base font-black tracking-widest leading-none",
              isActive ? "text-primary" : "text-on-surface"
            )}>
              {currency.code}
            </div>
            <div className="text-[10px] text-outline font-bold tracking-tight mt-1 opacity-80">
              {currency.name}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className={cn(
            "font-headline text-2xl sm:text-3xl font-black tracking-tighter transition-all duration-300",
            isActive ? "text-primary scale-110" : "text-on-surface"
          )}>
            {isActive ? inputString : val.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          {isActive && (
            <motion.div 
              layoutId="active-indicator"
              className="h-1 w-6 bg-primary rounded-full mt-1.5"
            />
          )}
        </div>
      </motion.div>
    </Reorder.Item>
  );
}
