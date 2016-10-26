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
import {CheWorkspace} from '../../../../components/api/che-workspace.factory';
import {ComposeEnvironmentManager} from '../../../../components/api/environment/compose-environment-manager';
import {CheEnvironmentRegistry} from '../../../../components/api/environment/che-environment-registry.factory';

/**
 * @ngdoc controller
 * @name workspaces.workspace.stacks.controller:WorkspaceStacksController
 * @description This class is handling the controller for stacks selection
 * @author Oleksii Kurinnyi
 */

const DEFAULT_WORKSPACE_RAM: number = 2 * Math.pow(1024, 3);

export class WorkspaceStacksController {
  $log: ng.ILogService;
  $scope: ng.IScope;
  cheWorkspace: CheWorkspace;
  composeEnvironmentManager: ComposeEnvironmentManager;

  tabName: string;

  isCustomStack: boolean = false;
  recipeUrl: string;
  recipeScript: string;
  recipeFormat: string = 'compose';

  isWorkspaceConfig: boolean = false;

  stack: any = null;
  selectSourceOption: string;

  workspaceName: string;
  workspaceStackOnChange: Function;

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor($log: ng.ILogService, $scope: ng.IScope, cheWorkspace: CheWorkspace, cheEnvironmentRegistry: CheEnvironmentRegistry) {
    this.$log = $log;
    this.cheWorkspace = cheWorkspace;
    this.composeEnvironmentManager = cheEnvironmentRegistry.getEnvironmentManager('compose');

    $scope.$watch(() => { return this.recipeScript; }, () => {
      if (this.isCustomStack) {
        this.cheStackLibrarySelecter(null);
      }
    });
    $scope.$watch(() => { return this.recipeUrl; }, () => {
      if (this.isCustomStack) {
        this.cheStackLibrarySelecter(null);
      }
    });
    $scope.$watch(() => { return this.recipeFormat; }, () => {
      if (this.isCustomStack) {
        this.cheStackLibrarySelecter(null);
      }
    });
  }

  /**
   * Callback when tab has been change.
   *
   * @param tabName {string} the select tab name
   */
  setStackTab(tabName: string): void {
    this.tabName = tabName;
    if (tabName === 'stack-import' || tabName === 'stack-authoring') {
      this.isWorkspaceConfig = false;
      if (tabName === 'stack-import') {
        this.recipeScript = null;
      } else {
        this.recipeUrl = null;
      }
      this.isCustomStack = true;
      this.cheStackLibrarySelecter(null);
    } else if (tabName === 'config') {
      // config import
      this.isWorkspaceConfig = true;
      this.isCustomStack = false;
      this.recipeScript = null;
      this.recipeUrl = null;
    } else {
      // ready-to-go, stack library
      this.isWorkspaceConfig = false;
      this.isCustomStack = false;
      this.recipeScript = null;
      this.recipeUrl = null;
    }
  }

  /**
   * Callback when stack has been set.
   *
   * @param stack {object} the selected stack
   */
  cheStackLibrarySelecter(stack: any): void {
    let workspaceName = this.workspaceName;

    if (this.isWorkspaceConfig && stack && stack.workspaceConfig) {
      workspaceName = stack.workspaceConfig.name;
    }
    this.stack = angular.copy(stack);

    let source = this.getSource(),
        config = this.buildWorkspaceConfig(source, workspaceName);

    if (!config.defaultEnv || (!this.stack && !this.recipeFormat)) {
      return;
    }

    this.workspaceStackOnChange({config: config});
  }

  /**
   * Builds workspace config.
   *
   * @param source {object}
   * @param workspaceName {string}
   * @returns {config}
   */
  buildWorkspaceConfig(source: any, workspaceName: string): any {
    let stackWorkspaceConfig;
    if (this.stack) {
      stackWorkspaceConfig = this.stack.workspaceConfig;
    } else if (!this.stack && source && source.format === 'compose' && source.content) {
      let machines    = this.composeEnvironmentManager.getMachines({recipe: source}),
          environment = this.composeEnvironmentManager.getEnvironment({recipe: source}, machines);
      stackWorkspaceConfig = {
        defaultEnv: workspaceName,
        environments: {
          [workspaceName]: environment
        }
      };
    }

    return this.cheWorkspace.formWorkspaceConfig(stackWorkspaceConfig, workspaceName, source, DEFAULT_WORKSPACE_RAM);
  }

  /**
   * Returns stack source.
   *
   * @returns {object}
   */
  getSource(): any {
    let source: any = {};
    source.type = 'dockerfile';
    // user provides recipe URL or recipe's content:
    if (this.isCustomStack) {
      this.stack = null;
      source.type = 'environment';
      source.format = this.recipeFormat;
      if (this.recipeUrl && this.recipeUrl.length > 0) {
        source.location = this.recipeUrl;
      } else {
        source.content = this.recipeScript;
      }
    } else if (this.stack) {
      // check predefined recipe location
      if (this.stack && this.stack.source && this.stack.source.type === 'location') {
        this.recipeUrl = this.stack.source.origin;
        source.location = this.recipeUrl;
      } else {
        source = this.getSourceFromStack(this.stack);
      }
    }
    return source;
  }

  /**
   * Detects machine source from pointed stack.
   *
   * @param stack {object} to retrieve described source
   * @returns {source} machine source config
   */
  getSourceFromStack(stack: any): any {
    let source: any = {};
    source.type = 'dockerfile';

    switch (stack.source.type.toLowerCase()) {
      case 'image':
        source.content = 'FROM ' + stack.source.origin;
        break;
      case 'dockerfile':
        source.content = stack.source.origin;
        break;
      default:
        throw 'Not implemented';
    }

    return source;
  }
}
