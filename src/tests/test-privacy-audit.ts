import { authService } from '../services/authService';
import { habitsService } from '../services/habitsService';
import { tasksService } from '../services/tasksService';
import { plannerService } from '../services/plannerService';
import { sharedGoalsService } from '../services/sharedGoalsService';
import { friendsService } from '../services/friendsService';
import { notificationsService } from '../services/notificationsService';
import { AuthorizationError } from '../services/securityGuard';

// Mock localStorage for Node environment if running in CLI
if (typeof localStorage === 'undefined' || localStorage === null) {
  const store: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };
}

export async function runPrivacyAndAuthorizationAudit() {
  console.log('====================================================');
  console.log('🔒 GROWTOGETHER PRIVACY & AUTHORIZATION AUDIT SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assertTest(description: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${description}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  async function assertAsyncTest(description: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${description}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // Set active authenticated session for User A (Alex Rivers: usr_demo_123)
  const userA = {
    id: 'usr_demo_123',
    username: 'alex_grower',
    displayName: 'Alex Rivers',
    streakCount: 14,
  };
  localStorage.setItem('growtogether_auth_session', JSON.stringify(userA));

  // ----------------------------------------------------
  // TEST SUITE 1: Parameter & URL Tampering Protection
  // ----------------------------------------------------
  console.log('🔹 Test Suite 1: Parameter & User ID Tampering (User A -> User B Data)');

  assertTest('User A cannot fetch User B\'s private habits', () => {
    try {
      habitsService.getHabits('usr_dinesh_101');
      throw new Error('FAILED SECURITY CHECK: Service allowed User A to read User B\'s habits!');
    } catch (e: any) {
      if (!(e instanceof AuthorizationError)) throw e;
    }
  });

  assertTest('User A cannot fetch User B\'s private tasks', () => {
    try {
      tasksService.getTasks('usr_dinesh_101');
      throw new Error('FAILED SECURITY CHECK: Service allowed User A to read User B\'s tasks!');
    } catch (e: any) {
      if (!(e instanceof AuthorizationError)) throw e;
    }
  });

  assertTest('User A cannot fetch User B\'s private planner blocks', () => {
    try {
      plannerService.getBlocks('usr_dinesh_101');
      throw new Error('FAILED SECURITY CHECK: Service allowed User A to read User B\'s planner!');
    } catch (e: any) {
      if (!(e instanceof AuthorizationError)) throw e;
    }
  });

  assertTest('User A cannot fetch User B\'s private notifications', () => {
    try {
      notificationsService.getNotifications('usr_dinesh_101');
      throw new Error('FAILED SECURITY CHECK: Service allowed User A to read User B\'s notifications!');
    } catch (e: any) {
      if (!(e instanceof AuthorizationError)) throw e;
    }
  });

  // ----------------------------------------------------
  // TEST SUITE 2: Resource ID Modification Attack
  // ----------------------------------------------------
  console.log('\n🔹 Test Suite 2: Resource ID Modification Attack (User A modifying User B items)');

  assertTest('User A cannot edit User B\'s habit', () => {
    try {
      habitsService.updateHabit('usr_dinesh_101', 'h_dinesh_study', { title: 'Tampered' });
      throw new Error('FAILED SECURITY CHECK: Service allowed User A to update User B\'s habit!');
    } catch (e: any) {
      if (!(e instanceof AuthorizationError)) throw e;
    }
  });

  assertTest('User A cannot delete User B\'s task', () => {
    try {
      tasksService.deleteTask('usr_dinesh_101', 't_dinesh_99');
      throw new Error('FAILED SECURITY CHECK: Service allowed User A to delete User B\'s task!');
    } catch (e: any) {
      if (!(e instanceof AuthorizationError)) throw e;
    }
  });

  assertTest('User A cannot delete User B\'s planner event', () => {
    try {
      plannerService.deleteBlock('usr_dinesh_101', 'pb_dinesh_77');
      throw new Error('FAILED SECURITY CHECK: Service allowed User A to delete User B\'s planner event!');
    } catch (e: any) {
      if (!(e instanceof AuthorizationError)) throw e;
    }
  });

  // ----------------------------------------------------
  // TEST SUITE 3: Default Private Scope Verification
  // ----------------------------------------------------
  console.log('\n🔹 Test Suite 3: Default Sharing State Enforcement');

  assertTest('New Habit defaults to isPrivate: true', () => {
    const habit = habitsService.createHabit(userA.id, {
      title: 'Private Journaling',
      category: 'mindset',
      frequency: 'daily',
      targetDays: 7,
      startDate: '2026-09-12',
    });
    if (habit.isPrivate !== true) {
      throw new Error(`Expected isPrivate: true, got ${habit.isPrivate}`);
    }
  });

  assertTest('New Task defaults to isPrivate: true', () => {
    const task = tasksService.createTask(userA.id, {
      title: 'Private Task',
      dueDate: '2026-09-12',
      priority: 'high',
      category: 'focus',
    });
    if (task.isPrivate !== true) {
      throw new Error(`Expected isPrivate: true, got ${task.isPrivate}`);
    }
  });

  assertTest('New Planner Block defaults to isPrivate: true', () => {
    const block = plannerService.createBlock(userA.id, {
      title: 'Private Focus Session',
      blockDate: '2026-09-12',
      startTime: '10:00',
      endTime: '11:00',
      category: 'work',
    });
    if (block.isPrivate !== true) {
      throw new Error(`Expected isPrivate: true, got ${block.isPrivate}`);
    }
  });

  // ----------------------------------------------------
  // TEST SUITE 4: Shared Resource Authorization
  // ----------------------------------------------------
  console.log('\n🔹 Test Suite 4: Shared Goals Access Control');

  assertTest('User A cannot read a Shared Goal if User A is not a member', () => {
    // Seed private goal between User C and User D
    const privateGoal = {
      id: 'sg_private_charlie_dave',
      creatorId: 'usr_charlie_999',
      title: 'Secret Goal',
      targetHabitTitle: 'Secret Habit',
      targetDays: 30,
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      status: 'active' as const,
      members: [
        { userId: 'usr_charlie_999', displayName: 'Charlie', username: 'charlie', status: 'accepted' as const, joinedAt: '2026-09-01' },
        { userId: 'usr_dave_888', displayName: 'Dave', username: 'dave', status: 'accepted' as const, joinedAt: '2026-09-01' },
      ],
      createdAt: '2026-09-01',
    };
    sharedGoalsService.saveStorageRecords([privateGoal]);

    try {
      sharedGoalsService.getSharedGoalById(userA.id, 'sg_private_charlie_dave');
      throw new Error('FAILED SECURITY CHECK: Service allowed non-member User A to read private Shared Goal!');
    } catch (e: any) {
      if (!(e instanceof AuthorizationError)) throw e;
    }
  });

  // ----------------------------------------------------
  // TEST SUITE 5: Password Hash & Sensitive Data Protection
  // ----------------------------------------------------
  console.log('\n🔹 Test Suite 5: Password Hash & Sensitive Data Protection');

  await assertAsyncTest('User Search results never leak password hashes', async () => {
    const searchResults = await friendsService.searchUsers(userA.id, 'dinesh');
    if (searchResults.length === 0) {
      throw new Error('No search results returned for dinesh');
    }

    searchResults.forEach(res => {
      if ((res.profile as any).passwordHash !== undefined) {
        throw new Error(`SECURITY LEAK: Found passwordHash on user profile ${res.profile.username}!`);
      }
    });
  });

  console.log('\n----------------------------------------------------');
  console.log(`AUDIT RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('----------------------------------------------------\n');

  if (failed > 0) {
    throw new Error(`${failed} Privacy Audit tests failed.`);
  }
}

// Execute if run directly
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  runPrivacyAndAuthorizationAudit().catch(err => {
    console.error('Audit execution error:', err);
  });
}
