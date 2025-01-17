// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import React, { ReactElement, useState } from 'react';
import MuiBox from '@mui/material/Box';
import { NotificationPopup } from '../NotificationPopup/NotificationPopup';
import { ButtonText } from '../../enums/enums';
import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import { closePopup } from '../../state/actions/view-actions/view-actions';
import { OpossumColors } from '../../shared-styles';
import { PathBar } from '../PathBar/PathBar';
import { AttributionWizardPackageStep } from '../AttributionWizardPackageStep/AttributionWizardPackageStep';
import { AttributionWizardVersionStep } from '../AttributionWizardVersionStep/AttributionWizardVersionStep';
import { ButtonConfig } from '../../types/types';
import {
  getExternalData,
  getManualAttributions,
  getManualData,
} from '../../state/selectors/all-views-resource-selectors';
import {
  getResolvedExternalAttributions,
  getSelectedResourceId,
} from '../../state/selectors/audit-view-resource-selectors';
import {
  getAllAttributionIdsWithCountsFromResourceAndChildren,
  getAttributionWizardPackageListsItems,
  getPreSelectedPackageAttributeIds,
} from './attribution-wizard-popup-helpers';
import { getPopupAttributionId } from '../../state/selectors/view-selector';
import { PackageInfo } from '../../../shared/shared-types';
import { setTemporaryPackageInfo } from '../../state/actions/resource-actions/all-views-simple-actions';

const MAXIMUM_NUMBER_OF_TABLES_IN_SINGLE_STEP = 2;
const TABLE_WIDTH = 250;
const GAP_BETWEEN_TABLES = 20;
const PATH_BAR_TOTAL_HEIGHT = 62;
const BREADCRUMBS_TOTAL_HEIGHT = 42;
const attributionWizardPopupHeader = 'Attribution Wizard';

const MAIN_CONTENT_WIDTH =
  MAXIMUM_NUMBER_OF_TABLES_IN_SINGLE_STEP * TABLE_WIDTH +
  (MAXIMUM_NUMBER_OF_TABLES_IN_SINGLE_STEP - 1) * GAP_BETWEEN_TABLES;

const classes = {
  dialogContent: {
    backgroundColor: OpossumColors.lightestBlue,
    height: '75vh',
    margin: '0px 24px 12px 24px',
  },
  mainContentBox: {
    width: `${MAIN_CONTENT_WIDTH}px`,
    marginTop: '15px',
    height: `calc(100% - ${PATH_BAR_TOTAL_HEIGHT}px - ${BREADCRUMBS_TOTAL_HEIGHT}px)`,
  },
  pathBar: {
    margin: '24px 0px 12px 0px',
    padding: '1px 0px 1px 5px',
  },
  breadcrumbs: {
    height: `calc(${BREADCRUMBS_TOTAL_HEIGHT}px - 20px)`,
    marginBottom: '20px',
  },
  listBox: {
    gap: `${GAP_BETWEEN_TABLES}px`,
  },
  list: {
    width: `${TABLE_WIDTH}px`,
  },
};

export function AttributionWizardPopup(): ReactElement {
  const selectedResourceId = useAppSelector(getSelectedResourceId);
  const externalData = useAppSelector(getExternalData);
  const manualData = useAppSelector(getManualData);

  const resolvedExternalAttributions = useAppSelector(
    getResolvedExternalAttributions
  );
  const popupAttributionId = useAppSelector(getPopupAttributionId);
  const manualAttributions = useAppSelector(getManualAttributions);

  const [manuallyAddedNamespaces, setManuallyAddedNamespaces] = useState<
    Array<string>
  >([]);
  const [manuallyAddedNames, setManuallyAddedNames] = useState<Array<string>>(
    []
  );
  const [manuallyAddedVersions, setManuallyAddedVersions] = useState<
    Array<string>
  >([]);

  const dispatch = useAppDispatch();
  function closeAttributionWizardPopup(): void {
    dispatch(closePopup());
  }

  const popupAttribution =
    popupAttributionId !== null ? manualAttributions[popupAttributionId] : {};
  const {
    preSelectedPackageNamespaceId,
    preSelectedPackageNameId,
    preSelectedPackageVersionId,
  } = getPreSelectedPackageAttributeIds(popupAttribution);

  const wizardStepIdsToDisplayValues: Array<[string, string]> = [
    ['packageNamespaceAndName', 'package'],
    ['packageVersion', 'version'],
  ];
  const wizardStepIds = wizardStepIdsToDisplayValues.map(
    (idAndDisplayValue) => idAndDisplayValue[0]
  );

  const [selectedPackageNamespaceId, setSelectedPackageNamespaceId] =
    useState<string>(preSelectedPackageNamespaceId);
  const [selectedPackageNameId, setSelectedPackageNameId] = useState<string>(
    preSelectedPackageNameId
  );
  const [selectedPackageVersionId, setSelectedPackageVersionId] =
    useState<string>(preSelectedPackageVersionId);
  const [selectedWizardStepId, setSelectedWizardStepId] = useState<string>(
    wizardStepIds[0]
  );

  const isPackageNamespaceAndNameSelected =
    selectedPackageNamespaceId !== '' && selectedPackageNameId !== '';
  const isPackageVersionSelected = selectedPackageVersionId !== '';

  const allAttributionIdsOfResourceAndChildrenWithCounts =
    getAllAttributionIdsWithCountsFromResourceAndChildren(
      selectedResourceId,
      externalData,
      manualData,
      resolvedExternalAttributions
    );

  const {
    sortedAttributedPackageNamespacesWithManuallyAddedOnes,
    sortedAttributedPackageNamesWithManuallyAddedOnes,
    sortedAttributedPackageVersionsWithManuallyAddedOnes,
    selectedPackageNamespace,
    selectedPackageName,
    highlightedPackageNameIds,
  } = getAttributionWizardPackageListsItems(
    allAttributionIdsOfResourceAndChildrenWithCounts,
    {
      ...externalData.attributions,
      ...manualData.attributions,
    },
    manuallyAddedNamespaces,
    manuallyAddedNames,
    manuallyAddedVersions,
    selectedPackageNamespaceId,
    selectedPackageNameId
  );

  let selectedPackageVersion = '';
  if (selectedPackageVersionId !== '') {
    const attributedPackageVersion =
      sortedAttributedPackageVersionsWithManuallyAddedOnes.filter(
        (item) => item.id === selectedPackageVersionId
      )[0];

    if (attributedPackageVersion === undefined) {
      setSelectedPackageVersionId('');
    } else {
      selectedPackageVersion = attributedPackageVersion.text;
    }
  }

  const selectedPackageInfo: PackageInfo = {
    packageType: popupAttribution.packageType ?? 'generic',
    packageName: selectedPackageName ? selectedPackageName : undefined,
    packageNamespace: selectedPackageNamespace
      ? selectedPackageNamespace
      : undefined,
    packageVersion: selectedPackageVersion ? selectedPackageVersion : undefined,
  };

  const handleBreadcrumbsClick = function (wizardStepId: string): void {
    setSelectedWizardStepId(wizardStepId);
  };
  function handleNextClick(): void {
    if (selectedWizardStepId !== wizardStepIds[wizardStepIds.length - 1]) {
      setSelectedWizardStepId(
        wizardStepIds[wizardStepIds.indexOf(selectedWizardStepId) + 1]
      );
    }
  }
  function handleBackClick(): void {
    if (selectedWizardStepId !== wizardStepIds[0]) {
      setSelectedWizardStepId(
        wizardStepIds[wizardStepIds.indexOf(selectedWizardStepId) - 1]
      );
    }
  }
  function handlePackageNamespaceListItemClick(id: string): void {
    setSelectedPackageNamespaceId(id);
  }
  function handlePackageNameListItemClick(id: string): void {
    setSelectedPackageNameId(id);
  }
  function handlePackageVersionListItemClick(id: string): void {
    setSelectedPackageVersionId(id);
  }
  function handleApplyClick(): void {
    dispatch(
      setTemporaryPackageInfo({
        ...popupAttribution,
        ...selectedPackageInfo,
      })
    );
    closeAttributionWizardPopup();
  }

  const nextButtonConfig: ButtonConfig = {
    buttonText: ButtonText.Next,
    onClick: handleNextClick,
    disabled: !isPackageNamespaceAndNameSelected,
    isDark: true,
    tooltipText: isPackageNamespaceAndNameSelected
      ? ''
      : 'Please select package namespace and name to continue',
    tooltipPlacement: 'top',
  };
  const backButtonConfig: ButtonConfig = {
    buttonText: ButtonText.Back,
    onClick: handleBackClick,
    disabled: false,
    isDark: false,
  };
  const cancelButtonConfig: ButtonConfig = {
    buttonText: ButtonText.Cancel,
    onClick: closeAttributionWizardPopup,
    disabled: false,
    isDark: false,
  };
  const applyButtonConfig: ButtonConfig = {
    buttonText: ButtonText.Apply,
    onClick: handleApplyClick,
    disabled: !isPackageVersionSelected,
    isDark: true,
    tooltipText: !isPackageVersionSelected
      ? 'Please select package version to apply changes'
      : '',
    tooltipPlacement: 'top',
  };

  return (
    <NotificationPopup
      header={attributionWizardPopupHeader}
      centerLeftButtonConfig={
        selectedWizardStepId !== wizardStepIds[0] ? backButtonConfig : undefined
      }
      centerRightButtonConfig={
        selectedWizardStepId !== wizardStepIds[wizardStepIds.length - 1]
          ? nextButtonConfig
          : applyButtonConfig
      }
      rightButtonConfig={cancelButtonConfig}
      onBackdropClick={closeAttributionWizardPopup}
      onEscapeKeyDown={closeAttributionWizardPopup}
      isOpen={true}
      fullWidth={false}
      contentSx={classes.dialogContent}
      content={
        <>
          <PathBar sx={classes.pathBar} />
          <Breadcrumbs
            selectedId={selectedWizardStepId}
            onClick={handleBreadcrumbsClick}
            idsToDisplayValues={wizardStepIdsToDisplayValues}
            sx={classes.breadcrumbs}
          />
          <MuiBox sx={classes.mainContentBox}>
            {selectedWizardStepId === wizardStepIds[0] ? (
              <AttributionWizardPackageStep
                attributedPackageNamespaces={
                  sortedAttributedPackageNamespacesWithManuallyAddedOnes
                }
                attributedPackageNames={
                  sortedAttributedPackageNamesWithManuallyAddedOnes
                }
                selectedPackageInfo={selectedPackageInfo}
                selectedPackageNamespaceId={selectedPackageNamespaceId}
                selectedPackageNameId={selectedPackageNameId}
                handlePackageNamespaceListItemClick={
                  handlePackageNamespaceListItemClick
                }
                handlePackageNameListItemClick={handlePackageNameListItemClick}
                manuallyAddedNamespaces={manuallyAddedNamespaces}
                setManuallyAddedNamespaces={setManuallyAddedNamespaces}
                manuallyAddedNames={manuallyAddedNames}
                setManuallyAddedNames={setManuallyAddedNames}
                listBoxSx={classes.listBox}
                listSx={classes.list}
              />
            ) : selectedWizardStepId === wizardStepIds[1] ? (
              <AttributionWizardVersionStep
                attributedPackageVersions={
                  sortedAttributedPackageVersionsWithManuallyAddedOnes
                }
                selectedPackageInfo={selectedPackageInfo}
                highlightedPackageNameIds={highlightedPackageNameIds}
                selectedPackageVersionId={selectedPackageVersionId}
                handlePackageVersionListItemClick={
                  handlePackageVersionListItemClick
                }
                manuallyAddedVersions={manuallyAddedVersions}
                setManuallyAddedVersions={setManuallyAddedVersions}
                listSx={classes.list}
              />
            ) : null}
          </MuiBox>
        </>
      }
    />
  );
}
