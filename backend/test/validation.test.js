import test from 'node:test';
import assert from 'node:assert/strict';
import {
    isEmail,
    isValidPassword,
    isValidColor,
    isValidDate,
    isValidTime,
    isNonNegativeInteger,
    isValidCategory,
    isValidRole,
    isValidItemType,
    isValidMessageContent,
} from '../utils/validation.js';

test('email validation', () => {
    assert.equal(isEmail('user@example.com'), true);
    assert.equal(isEmail('not-an-email'), false);
});

test('password validation enforces 8 to 72 bytes', () => {
    assert.equal(isValidPassword('12345678'), true);
    assert.equal(isValidPassword('1234567'), false);
    assert.equal(isValidPassword('x'.repeat(73)), false);
});

test('color, date and time validation', () => {
    assert.equal(isValidColor('#3b82f6'), true);
    assert.equal(isValidColor('3b82f6'), false);
    assert.equal(isValidDate('2026-10-29'), true);
    assert.equal(isValidDate('2026-02-30'), false);
    assert.equal(isValidTime('00:00'), true);
    assert.equal(isValidTime('24:00'), false);
});

test('numeric and enum validation', () => {
    assert.equal(isNonNegativeInteger(0), true);
    assert.equal(isNonNegativeInteger(-1), false);
    assert.equal(isNonNegativeInteger(1.5), false);
    assert.equal(isValidCategory('rehearsal'), true);
    assert.equal(isValidCategory('Rehearsal'), false);
    assert.equal(isValidRole('moderator'), true);
    assert.equal(isValidItemType('pause'), true);
});

test('message content validation', () => {
    assert.equal(isValidMessageContent('hello'), true);
    assert.equal(isValidMessageContent('   '), false);
    assert.equal(isValidMessageContent('x'.repeat(2001)), false);
});
