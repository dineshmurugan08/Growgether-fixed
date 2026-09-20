import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { TaskItem, TaskPriority, TaskCategory, TaskStatus } from '../types';
import { tasksService, CreateTaskInput } from '../services/tasksService';
import { motivationService } from '../services/motivationService';
import { useAuth } from '../context/AuthContext';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { MotivationalToast } from '../components/habits/MotivationalToast';
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ListTodo,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

type FilterTab = 'all' | 'today' | 'upcoming' | 'high' | 'completed';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [detailTask, setDetailTask] = useState<TaskItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Motivational toast state
  const [toastInfo, setToastInfo] = useState<{ show: boolean; title?: string; message: string; type?: any }>({
    show: false,
    message: '',
  });

  const loadTasks = () => {
    const data = tasksService.getTasks(userId);
    setTasks(data);
  };

  useEffect(() => {
    loadTasks();
  }, [userId]);

  const handleCreateOrUpdate = (input: CreateTaskInput) => {
    if (editingTask) {
      tasksService.updateTask(userId, editingTask.id, input);
    } else {
      tasksService.createTask(userId, input);
    }
    loadTasks();
    setEditingTask(null);
  };

  const handleToggleComplete = (task: TaskItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (task.status === 'completed') {
      tasksService.reopenTask(userId, task.id);
      loadTasks();
    } else {
      tasksService.completeTask(userId, task.id);
      loadTasks();

      // Compute contextual task feedback: 1st task ("Nice start. One step forward.") or 3rd task ("You're building momentum.")
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const todayCompletedCount = tasks.filter(t => t.dueDate === todayStr && t.status === 'completed').length + 1;
      const feedback = motivationService.getTaskCompletionFeedback(todayCompletedCount);

      setToastInfo({
        show: true,
        title: feedback.title,
        message: feedback.message,
        type: feedback.type,
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    tasksService.deleteTask(userId, taskId);
    loadTasks();
  };

  const handleReschedule = (taskId: string, newDate: string, newTime?: string) => {
    tasksService.rescheduleTask(userId, taskId, newDate, newTime);
    loadTasks();
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const openDetailModal = (task: TaskItem) => {
    setDetailTask(task);
    setIsDetailOpen(true);
  };

  // Filter & Search Logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (filterTab === 'today') return task.dueDate === todayStr;
    if (filterTab === 'upcoming') return task.dueDate > todayStr && task.status !== 'completed';
    if (filterTab === 'high') return task.priority === 'high';
    if (filterTab === 'completed') return task.status === 'completed';

    return true;
  });

  // Calculate Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const todayTasks = tasks.filter(t => t.dueDate === format(new Date(), 'yyyy-MM-dd'));
  const todayCompleted = todayTasks.filter(t => t.status === 'completed').length;
  const highPriorityCount = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="amber">High</Badge>;
      case 'medium':
        return <Badge variant="purple">Medium</Badge>;
      case 'low':
        return <Badge variant="neutral">Low</Badge>;
    }
  };

  return (
    <div className="gt-page">
      {/* Toast feedback */}
      {toastInfo.show && (
        <MotivationalToast
          title={toastInfo.title}
          message={toastInfo.message}
          type={toastInfo.type}
          onClose={() => setToastInfo(prev => ({ ...prev, show: false }))}
        />
      )}

      {/* Header */}
      <header className="gt-page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <ListTodo size={24} color="var(--primary-400)" /> Task Engine
          </h2>
          <p>Organize high-impact action items and focus blocks aligned with your growth.</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
        >
          Create Task
        </Button>
      </header>

      {/* Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <Card style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
            <CheckSquare size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Today's Tasks</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {todayCompleted} / {todayTasks.length} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>Done</span>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High Priority</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {highPriorityCount} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>Pending</span>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall Completion</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </div>
          </div>
        </Card>
      </div>

      {/* Control Bar: Filters & Search */}
      <Card style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Top Filter Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              <button
                className={`gt-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
                onClick={() => setFilterTab('all')}
              >
                All ({totalTasks})
              </button>
              <button
                className={`gt-tab-btn ${filterTab === 'today' ? 'active' : ''}`}
                onClick={() => setFilterTab('today')}
              >
                Today ({todayTasks.length})
              </button>
              <button
                className={`gt-tab-btn ${filterTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setFilterTab('upcoming')}
              >
                Upcoming
              </button>
              <button
                className={`gt-tab-btn ${filterTab === 'high' ? 'active' : ''}`}
                onClick={() => setFilterTab('high')}
              >
                High Priority ({highPriorityCount})
              </button>
              <button
                className={`gt-tab-btn ${filterTab === 'completed' ? 'active' : ''}`}
                onClick={() => setFilterTab('completed')}
              >
                Completed ({completedTasks})
              </button>
            </div>

            {/* Category Dropdown */}
            <select
              className="gt-select"
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="focus">⚡ Deep Focus</option>
              <option value="work">💼 Work / Project</option>
              <option value="personal">👤 Personal Growth</option>
              <option value="health">🏃‍♂️ Health & Wellness</option>
              <option value="social">🤝 Social & Community</option>
            </select>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="gt-input"
              style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
              placeholder="Search tasks by title or keywords..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Task List Section */}
      <Card>
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <CheckSquare size={36} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>No tasks found</h4>
            <p style={{ fontSize: '0.875rem' }}>
              {searchQuery ? 'Try clearing your search query or changing filters.' : 'Create a new task to start organizing your focus!'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredTasks.map(task => {
              const isDone = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  onClick={() => openDetailModal(task)}
                  className={`gt-task-item ${isDone ? 'gt-task-completed gt-anim-task-complete' : ''}`}
                >
                  <button
                    className={`gt-checkbox ${isDone ? 'checked gt-anim-habit-complete' : ''}`}
                    onClick={e => handleToggleComplete(task, e)}
                  >
                    {isDone && <CheckCircle2 size={16} color="#ffffff" />}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className={`gt-task-title ${isDone ? 'line-through' : ''}`}>
                        {task.title}
                      </span>
                      {getPriorityBadge(task.priority)}
                      <Badge variant="neutral" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                        {task.category}
                      </Badge>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.375rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={13} color="var(--primary-400)" /> {task.dueDate}
                      </span>
                      {task.dueTime && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={13} color="var(--text-muted)" /> {task.dueTime}
                        </span>
                      )}
                      {task.estimatedMinutes && (
                        <span style={{ color: 'var(--text-muted)' }}>
                          • {task.estimatedMinutes}m est
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        openEditModal(task);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modals */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        editingTask={editingTask}
      />

      <TaskDetailModal
        task={detailTask}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={task => openEditModal(task)}
        onDelete={id => handleDeleteTask(id)}
        onToggleComplete={task => handleToggleComplete(task)}
        onReschedule={(id, date, time) => handleReschedule(id, date, time)}
      />

      <style>{`
        .gt-tab-btn {
          background: transparent;
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          padding: 0.4rem 0.875rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gt-tab-btn:hover {
          color: #ffffff;
          border-color: var(--border-emerald);
        }

        .gt-tab-btn.active {
          background: var(--primary-soft);
          border-color: var(--border-emerald);
          color: var(--primary-400);
          font-weight: 600;
        }

        .gt-task-item {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 0.875rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gt-task-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--border-emerald);
          transform: translateY(-1px);
        }

        .gt-task-completed {
          opacity: 0.65;
          background: rgba(0, 0, 0, 0.2);
        }

        .gt-checkbox {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 2px solid var(--border-emerald);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .gt-checkbox:hover {
          border-color: var(--primary-400);
          background: rgba(16, 185, 129, 0.1);
        }

        .gt-checkbox.checked {
          background: var(--primary-500);
          border-color: var(--primary-500);
        }

        .gt-task-title {
          font-weight: 600;
          font-size: 0.95rem;
          color: #ffffff;
          transition: color 0.2s ease;
        }

        .gt-task-title.line-through {
          text-decoration: line-through;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
