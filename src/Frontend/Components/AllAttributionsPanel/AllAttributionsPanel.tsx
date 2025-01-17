// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import MuiPaper from '@mui/material/Paper';
import React, { ReactElement } from 'react';
import { Attributions } from '../../../shared/shared-types';
import { PackagePanelTitle } from '../../enums/enums';
import { selectAttributionInAccordionPanelOrOpenUnsavedPopup } from '../../state/actions/popup-actions/popup-actions';
import { addToSelectedResource } from '../../state/actions/resource-actions/save-actions';
import { OpossumColors } from '../../shared-styles';
import { PackageCardConfig } from '../../types/types';
import { useAppDispatch } from '../../state/hooks';
import { PackageList } from '../PackageList/PackageList';
import { PackageCard } from '../PackageCard/PackageCard';

const classes = {
  root: {
    padding: '10px',
    backgroundColor: OpossumColors.white,
  },
};

interface AllAttributionsPanelProps {
  attributions: Attributions;
  selectedAttributionId: string | null;
  attributionIds: Array<string>;
  isAddToPackageEnabled: boolean;
}

export function AllAttributionsPanel(
  props: AllAttributionsPanelProps
): ReactElement {
  const dispatch = useAppDispatch();

  function getPackageCard(attributionId: string): ReactElement | null {
    const packageInfo = props.attributions && props.attributions[attributionId];

    function onCardClick(): void {
      dispatch(
        selectAttributionInAccordionPanelOrOpenUnsavedPopup(
          PackagePanelTitle.AllAttributions,
          attributionId
        )
      );
    }

    function onAddClick(): void {
      dispatch(addToSelectedResource(packageInfo));
    }

    const cardConfig: PackageCardConfig = {
      isSelected: attributionId === props.selectedAttributionId,
      isPreSelected: Boolean(packageInfo.preSelected),
    };

    return (
      <PackageCard
        cardId={`all-attributions-${attributionId}`}
        onClick={onCardClick}
        onIconClick={props.isAddToPackageEnabled ? onAddClick : undefined}
        cardConfig={cardConfig}
        key={`PackageCard-${packageInfo.packageName}-${attributionId}`}
        packageInfo={packageInfo}
        hideResourceSpecificButtons={true}
        attributionId={attributionId}
        showOpenResourcesIcon={true}
      />
    );
  }

  return (
    <MuiPaper sx={classes.root} elevation={0} square={true}>
      <PackageList
        attributions={props.attributions}
        attributionIds={props.attributionIds}
        getAttributionCard={getPackageCard}
        maxNumberOfDisplayedItems={20}
        listTitle={PackagePanelTitle.AllAttributions}
      />
    </MuiPaper>
  );
}
