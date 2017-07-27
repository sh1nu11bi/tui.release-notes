'use strict';

const tnote = require('../src/github-release');

describe('tui-release-note', () => {
    describe('commit object creation', () => {
        const commitLog = '* 91dccdf Feat: title (resolves #22, #23) (#26) (authorrr)\n'
                        + '* 3bebcfd Refactor: title (#8) (future worker)\n'
                        + '* e639358 Fix: bug (fixes #21) (#25) (fixxer)\n';

        const [firstLine] = commitLog.split('\n');

        it('should capture 5 group on formated log', () => {
            const captureGroups = tnote.getCaptureGroupsByRegex(firstLine);

            expect(captureGroups.length).toBe(5);
            expect(captureGroups[0]).toBe(firstLine);
            expect(captureGroups[1]).toBe('91dccdf');
            expect(captureGroups[2]).toBe('Feat');
            expect(captureGroups[3]).toBe('title (resolves #22, #23) (#26)');
            expect(captureGroups[4]).toBe('(authorrr)');
        });

        it('should not capture group on non conforming log', () => {
            const nonConformingLog = '* 3bebcfd Feat/Relese note generator (#8762) (Victor Hom)';
            const captureGroups = tnote.getCaptureGroupsByRegex(nonConformingLog);

            expect(captureGroups).toBeNull();
        });

        it('should make commit object by capture group', () => {
            const captureGroups = [
                '', '91dccdf', 'Feat', 'title (resolves #22, #23) (#26)', '(authorrr)'
            ];
            const commitObject = tnote.makeCommitObject(captureGroups);

            expect(commitObject.sha1).toBe('91dccdf');
            expect(commitObject.type).toBe('Feat');
            expect(commitObject.title).toBe('title (resolves #22, #23) (#26)');
            expect(commitObject.author).toBe('(authorrr)');
        });

        it('should make commit object array by commit log', () => {
            const commitObjects = commitLog.split('\n').reduce(tnote.makeCommitObjects, []);

            expect(commitObjects.length).toBe(3);
            expect(commitObjects[0].type).toBe('Feat');
            expect(commitObjects[1].type).toBe('Refactor');
            expect(commitObjects[2].type).toBe('Fix');
        });
    });

    describe('release note rendering', () => {
        const commitObject = {
            sha1: '91dccdf',
            type: 'Feat',
            title: 'title',
            author: '(author)'
        };

        const typeRegexs = [
            /feat/i, /refactor|perf/i, /build/i, /doc/i, /fix/i
        ];

        const titles = [
            'Features', 'Enhancement', 'Build Related', 'Documentation', 'Bug Fixes'
        ];

        it('should render templete by commit object and title', () => {
            const featured = tnote.renderTemplate(commitObject, 0, 'Features');

            expect(featured).toBe('\n## Features\n\n* 91dccdf Feat: title (author)\n');
        });

        it('should make release note by commit object array', () => {
            const commitObjects = [commitObject];
            let releaseNote = '';
            typeRegexs.forEach((typeRegex, typeIndex) => {
                commitObjects
                    .filter(commit => typeRegex.test(commit.type))
                    .forEach((commit, commitIndex) => {
                        releaseNote += tnote.renderTemplate(commit, commitIndex, titles[typeIndex]);
                    });
            });

            expect(releaseNote).toBe('\n## Features\n\n* 91dccdf Feat: title (author)\n');
        });
    });
});