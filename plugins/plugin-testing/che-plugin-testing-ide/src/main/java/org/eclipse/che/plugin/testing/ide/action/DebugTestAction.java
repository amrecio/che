/*******************************************************************************
 * Copyright (c) 2012-2017 Codenvy, S.A.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Codenvy, S.A. - initial API and implementation
 *******************************************************************************/
package org.eclipse.che.plugin.testing.ide.action;

import com.google.inject.Singleton;
import com.google.web.bindery.event.shared.EventBus;

import org.eclipse.che.ide.api.action.ActionEvent;
import org.eclipse.che.ide.api.action.Presentation;
import org.eclipse.che.ide.api.app.AppContext;
import org.eclipse.che.ide.api.debug.DebugConfigurationsManager;
import org.eclipse.che.ide.api.notification.NotificationManager;
import org.eclipse.che.ide.dto.DtoFactory;
import org.eclipse.che.ide.util.Pair;
import org.eclipse.che.plugin.testing.ide.TestResources;
import org.eclipse.che.plugin.testing.ide.TestServiceClient;
import org.eclipse.che.plugin.testing.ide.handler.TestingHandler;
import org.eclipse.che.plugin.testing.ide.view2.TestResultPresenter;

import javax.inject.Inject;
import javax.validation.constraints.NotNull;

import static java.util.Collections.singletonList;
import static org.eclipse.che.ide.workspace.perspectives.project.ProjectPerspective.PROJECT_PERSPECTIVE_ID;

/** Action that allows to run tests from current editor. */
@Singleton
public class DebugTestAction extends RunDebugTestAbstractAction {
    @Inject
    public DebugTestAction(EventBus eventBus,
                           TestServiceClient client,
                           DebugConfigurationsManager debugConfigurationsManager,
                           DtoFactory dtoFactory,
                           TestResources testResources,
                           AppContext appContext,
                           NotificationManager notificationManager,
                           TestingHandler testingHandler,
                           TestResultPresenter testResultPresenter) {
        super(eventBus,
              testResultPresenter,
              testingHandler,
              debugConfigurationsManager,
              client,
              dtoFactory,
              appContext,
              notificationManager,
              singletonList(PROJECT_PERSPECTIVE_ID),
              "Debug Test",
              "Debug Test",
              testResources.debugIcon());
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        Pair<String, String> frameworkAndTestName = getTestingFrameworkAndTestName();
        actionPerformed(frameworkAndTestName, true);
    }

    @Override
    public void updateInPerspective(@NotNull ActionEvent event) {
        Presentation presentation = event.getPresentation();
        presentation.setVisible(isEditorInFocus);
        presentation.setEnabled(isEnable);
    }

}
