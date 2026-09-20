import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { plannerService, CreateBlockInput } from '../services/plannerService';
import { habitsService } from '../services/habitsService';
import { tasksService } from '../services/tasksService';
import { UnifiedPlannerItem } from '../types';
import { DayView } from '../components/planner/DayView';
import { WeekView } from '../components/planner/WeekView';
import { MonthView } from '../components/planner/MonthView';
import { PlannerEventModal } from '../components/planner/PlannerEventModal';
import { MotivationalToast } from '../components/habits/MotivationalToast';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, parseISO } from 'date-fns';

export const PlannerPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data Store for Unified Planner Items
  const [dayItems, setDayItems] = useState<UnifiedPlannerItem[]>([]);
  const [rangeItems, setRangeItems] = useState<Record<string, UnifiedPlannerItem[]>>({});

  // Toast state
  const [toastInfo, setToastInfo] = useState<{ show: boolean; message: string; streak: number }>({
    show: false,
    message: '',
    streak: 1,
  });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  const loadData = () => {
    if (!userId) return;

    if (viewMode === 'day') {
      const items = plannerService.getUnifiedItemsForDate(userId, selectedDateStr);
      setDayItems(items);
    } else if (viewMode === 'week') {
      const startDate = format(subDays(selectedDate, 7), 'yyyy-MM-dd');
      const endDate = format(addDays(selectedDate, 14), 'yyyy-MM-dd');
      const map = plannerService.getUnifiedItemsForRange(userId, startDate, endDate);
      setRangeItems(map);
    } else if (viewMode === 'month') {
      const startDate = format(subDays(selectedDate, 15), 'yyyy-MM-dd');
      const endDate = format(addDays(selectedDate, 45), 'yyyy-MM-dd');
      const map = plannerService.getUnifiedItemsForRange(userId, startDate, endDate);
      setRangeItems(map);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId, viewMode, selectedDateStr]);

  // Date Navigation Handlers
  const handlePrev = () => {
    if (viewMode === 'day') setSelectedDate(prev => subDays(prev, 1));
    else if (viewMode === 'week') setSelectedDate(prev => subWeeks(prev, 1));
    else if (viewMode === 'month') setSelectedDate(prev => subMonths(prev, 1));
  };

  const handleNext = () => {
    if (viewMode === 'day') setSelectedDate(prev => addDays(prev, 1));
    else if (viewMode === 'week') setSelectedDate(prev => addWeeks(prev, 1));
    else if (viewMode === 'month') setSelectedDate(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleSelectSpecificDate = (dateStr: string) => {
    setSelectedDate(parseISO(dateStr));
    setViewMode('day');
  };

  // Create Event Handler
  const handleCreateBlock = (input: CreateBlockInput) => {
    plannerService.createBlock(userId, input);
    loadData();
  };

  // Delete Block Handler
  const handleDeleteBlock = (blockId: string) => {
    plannerService.deleteBlock(userId, blockId);
    loadData();
  };

  // Toggle Completion Handler (Handles Events, Habits, and Tasks seamlessly!)
  const handleToggleComplete = (item: UnifiedPlannerItem) => {
    if (item.type === 'event') {
      plannerService.toggleBlockComplete(userId, item.originalId);
      loadData();
      if (!item.completed) {
        setToastInfo({
          show: true,
          message: `Scheduled activity "${item.title}" completed!`,
          streak: 1,
        });
      }
    } else if (item.type === 'habit') {
      habitsService.toggleHabitLog(userId, item.originalId, item.date, 'completed');
      loadData();
      const stats = habitsService.getHabitStats(userId, item.originalId);
      if (!item.completed) {
        setToastInfo({
          show: true,
          message: `Habit "${item.title}" completed! Consistency streak updated.`,
          streak: stats.currentStreak,
        });
      }
    } else if (item.type === 'task') {
      if (item.completed) {
        tasksService.reopenTask(userId, item.originalId);
      } else {
        tasksService.completeTask(userId, item.originalId);
        setToastInfo({
          show: true,
          message: `Task "${item.title}" completed! High focus moment!`,
          streak: 1,
        });
      }
      loadData();
    }
  };

  return (
    <div className="gt-page">
      {/* Toast Notification */}
      {toastInfo.show && (
        <MotivationalToast
          message={toastInfo.message}
          streakCount={toastInfo.streak}
          onClose={() => setToastInfo(prev => ({ ...prev, show: false }))}
        />
      )}

      {/* Page Header */}
      <header className="gt-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Calendar size={24} color="var(--cyan-teal)" />
            <h1 style={{ fontSize: '1.85rem' }}>Master Growth Planner</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Time-block events, study sessions, and personal activities seamlessly alongside habits and tasks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View Toggle */}
          <div className="gt-view-toggle">
            <button
              className={`gt-toggle-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              Day View
            </button>
            <button
              className={`gt-toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week View
            </button>
            <button
              className={`gt-toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month View
            </button>
          </div>

          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsModalOpen(true)}
          >
            Schedule Event
          </Button>
        </div>
      </header>

      {/* Navigation Header */}
      <Card style={{ padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button variant="ghost" size="sm" onClick={handlePrev} icon={<ChevronLeft size={18} />}>
              Prev
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="ghost" size="sm" onClick={handleNext} icon={<ChevronRight size={18} />}>
              Next
            </Button>
            <h2 style={{ fontSize: '1.2rem', marginLeft: '0.5rem', fontWeight: 700 }}>
              {viewMode === 'day' && format(selectedDate, 'EEEE, MMMM d, yyyy')}
              {viewMode === 'week' && `Week of ${format(selectedDate, 'MMMM d, yyyy')}`}
              {viewMode === 'month' && format(selectedDate, 'MMMM yyyy')}
            </h2>
          </div>

          <Badge variant="cyan" icon={<Clock size={12} />}>
            {viewMode.toUpperCase()} VIEW ACTIVE
          </Badge>
        </div>
      </Card>

      {/* Main View Area */}
      {viewMode === 'day' && (
        <DayView
          dateStr={selectedDateStr}
          items={dayItems}
          onToggleComplete={handleToggleComplete}
          onDeleteBlock={handleDeleteBlock}
        />
      )}

      {viewMode === 'week' && (
        <WeekView
          currentDate={selectedDate}
          itemsByDate={rangeItems}
          onSelectDate={handleSelectSpecificDate}
          onToggleComplete={handleToggleComplete}
        />
      )}

      {viewMode === 'month' && (
        <MonthView
          currentDate={selectedDate}
          itemsByDate={rangeItems}
          onSelectDate={handleSelectSpecificDate}
        />
      )}

      {/* Schedule Event Modal */}
      <PlannerEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBlock}
        initialDate={selectedDateStr}
      />

      <style>{`
        .gt-page { display: flex; flex-direction: column; gap: 1.25rem; }
        .gt-page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }

        .gt-view-toggle {
          display: flex;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 3px;
        }

        .gt-toggle-btn {
          padding: 0.4rem 0.875rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.825rem;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gt-toggle-btn.active {
          background: var(--primary-soft);
          border: 1px solid var(--border-emerald);
          color: var(--primary-400);
        }
      `}</style>
    </div>
  );
};
