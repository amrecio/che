/*
 * Copyright (c) 2015-2016 Codenvy, S.A.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Codenvy, S.A. - initial API and implementation
 */
'use strict';

/**
 * This class is handling the stacks retrieval
 * It sets to the array of stacks
 * @author Florent Benoit
 * @author Ann Shumilova
 */
export class CheStack {
  $resource: ng.resource.IResourceService;
  stacksById: {[stackId: string]: {stack: any}};
  stacks: Array<any>;
  usedStackNames: Array<string>;
  remoteStackAPI: ng.resource.IResourceClass<ng.resource.IResource<any>>;
  remoteStackAPI: {
    getStacks: Function,
    getStack: Function,
    updateStack: Function,
    createStack: Function,
    deleteStack: Function
  };

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor($resource) {

    // keep resource
    this.$resource = $resource;

    // stacks per id
    this.stacksById = {};

    // stacks
    this.stacks = [];

    // stack names
    this.usedStackNames = [];

    // remote call
    this.remoteStackAPI = this.$resource('/api/stack', {}, {
      getStacks: {method: 'GET', url: '/api/stack?maxItems=50', isArray: true}, //TODO 50 items is temp solution while paging is not added
      getStack: {method: 'GET', url: '/api/stack/:stackId'},
      updateStack: {method: 'PUT', url: '/api/stack/:stackId'},
      createStack: {method: 'POST', url: '/api/stack'},
      deleteStack: {method: 'DELETE', url: '/api/stack/:stackId'}
    });
  }

  /**
   * Gets stack template
   * @returns {stack}
   */
  getStackTemplate(): any {
    let stack: any = {
      'name': 'New Stack',
      'description': 'New Java Stack',
      'scope': 'general',
      'tags': [
        'Java 1.8'
      ],
      'components': [],
      'source': {
        'type': 'image',
        'origin': 'codenvy/ubuntu_jdk8'
      },
      'workspaceConfig': {
        'environments': {
          'default': {
            'machines': {
              'dev-machine': {
                'agents': [
                  'org.eclipse.che.terminal', 'org.eclipse.che.ws-agent', 'org.eclipse.che.ssh'
                ],
                'servers': {},
                'attributes': {
                  'memoryLimitBytes': '2147483648'
                }
              }
            },
            'recipe': {
              'content': 'services:\n dev-machine:\n  image: codenvy/ubuntu_jdk8\n',
              'contentType': 'application/x-yaml',
              'type': 'compose'
            }
          }
        },
        'name': 'default',
        'defaultEnv': 'default',
        'description': null,
        'commands': []
      }
    };

    if (!this.isUniqueName(stack.name)) {
      stack.name += ' ';
      for (let pos: number = 1; pos < 1000; pos++) {
        if (this.isUniqueName(stack.name + pos.toString())) {
          stack.name += pos.toString();
          break;
        }
      }
    }
    return stack;
  }

  /**
   * Check if the stack's name is unique.
   * @param name: string
   * @returns {boolean}
   */
  isUniqueName(name: string): boolean {
    return this.usedStackNames.indexOf(name) === -1;
  }

  /**
   * Fetch the stacks
   */
  fetchStacks() {
    let promise = this.remoteStackAPI.getStacks().$promise;
    let updatedPromise = promise.then((stacks) => {
      // reset global stacks list
      this.stacks.length = 0;
      for (let member: any in this.stacksById) {
        delete this.stacksById[member];
      }
      // reset global stack names list
      this.usedStackNames.length = 0;
      stacks.forEach((stack: any) => {
        this.usedStackNames.push(stack.name);
        // add element on the list
        this.stacksById[stack.id] = stack;
        this.stacks.push(stack);
      });
    });

    return updatedPromise;
  }

  /**
   * Gets all stacks
   * @returns {Array}
   */
  getStacks() {
    return this.stacks;
  }

  /**
   * The stacks per id
   * @returns {*}
   */
  getStackById(id) {
    return this.stacksById[id];
  }

  /**
   * Creates new stack.
   * @param stack data for new stack
   * @returns {$promise|*|T.$promise}
   */
  createStack(stack) {
    return this.remoteStackAPI.createStack({}, stack).$promise;
  }

  /**
   * Fetch pointed stack.
   * @param stackId stack's id
   * @returns {$promise|*|T.$promise}
   */
  fetchStack(stackId) {
    return this.remoteStackAPI.getStack({stackId: stackId}).$promise;
  }

  /**
   * Update pointed stack.
   * @param stackId stack's id
   * @returns {$promise|*|T.$promise}
   */
  updateStack(stackId, stack) {
    return this.remoteStackAPI.updateStack({stackId: stackId}, stack).$promise;
  }

  /**
   * Delete pointed stack.
   * @param stackId stack's id
   * @returns {$promise|*|T.$promise}
   */
  deleteStack(stackId) {
    return this.remoteStackAPI.deleteStack({stackId: stackId}).$promise;
  }
}


