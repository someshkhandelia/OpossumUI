// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import React, { ReactElement } from 'react';
import MuiBox from '@mui/material/Box';
import { PackageInfo } from '../../../shared/shared-types';
import { ListWithAttributesItem } from '../../types/types';
import { generatePurlFromPackageInfo } from '../../util/handle-purl';
import { ListWithAttributes } from '../ListWithAttributes/ListWithAttributes';
import { TextBox } from '../InputElements/TextBox';
import { doNothing } from '../../util/do-nothing';
import {
  attributionWizardStepClasses,
  ATTRIBUTION_WIZARD_PURL_TOTAL_HEIGHT,
} from '../../shared-styles';
import { SxProps } from '@mui/system';

const classes = {
  listBox: {
    display: 'flex',
    gap: '25px',
    maxHeight: `calc(100% - ${ATTRIBUTION_WIZARD_PURL_TOTAL_HEIGHT}px)`,
  },
};
interface AttributionWizardPackageStepProps {
  attributedPackageNamespaces: Array<ListWithAttributesItem>;
  attributedPackageNames: Array<ListWithAttributesItem>;
  selectedPackageInfo: PackageInfo;
  selectedPackageNamespaceId: string;
  selectedPackageNameId: string;
  handlePackageNamespaceListItemClick: (id: string) => void;
  handlePackageNameListItemClick: (id: string) => void;
  manuallyAddedNamespaces: Array<string>;
  setManuallyAddedNamespaces(items: Array<string>): void;
  manuallyAddedNames: Array<string>;
  setManuallyAddedNames(items: Array<string>): void;
  listBoxSx?: SxProps;
  listSx?: SxProps;
}

export function AttributionWizardPackageStep(
  props: AttributionWizardPackageStepProps
): ReactElement {
  const selectedPackageInfoWithoutVersion = {
    ...props.selectedPackageInfo,
    packageVersion: undefined,
  };
  const temporaryPurl = generatePurlFromPackageInfo(
    selectedPackageInfoWithoutVersion
  );

  return (
    <MuiBox sx={attributionWizardStepClasses.root}>
      <TextBox
        title={'PURL'}
        isEditable={false}
        text={temporaryPurl}
        isHighlighted={false}
        handleChange={doNothing}
        sx={attributionWizardStepClasses.purlRoot}
        textFieldInputSx={attributionWizardStepClasses.purlText}
      />
      <MuiBox sx={{ ...classes.listBox, ...props.listBoxSx }}>
        <ListWithAttributes
          listItems={props.attributedPackageNamespaces}
          selectedListItemId={props.selectedPackageNamespaceId}
          handleListItemClick={props.handlePackageNamespaceListItemClick}
          showChipsForAttributes={false}
          showAddNewListItem={true}
          manuallyAddedListItems={props.manuallyAddedNamespaces}
          setManuallyAddedListItems={props.setManuallyAddedNamespaces}
          title={'Package namespace'}
          listSx={props.listSx}
        />
        <ListWithAttributes
          listItems={props.attributedPackageNames}
          selectedListItemId={props.selectedPackageNameId}
          handleListItemClick={props.handlePackageNameListItemClick}
          showChipsForAttributes={false}
          showAddNewListItem={true}
          manuallyAddedListItems={props.manuallyAddedNames}
          setManuallyAddedListItems={props.setManuallyAddedNames}
          title={'Package name'}
          listSx={props.listSx}
        />
      </MuiBox>
    </MuiBox>
  );
}
