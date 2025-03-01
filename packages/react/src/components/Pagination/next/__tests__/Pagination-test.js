/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CaretRight, CaretLeft } from '@carbon/icons-react';
import { shallow, mount } from 'enzyme';
import React from 'react';
import Pagination from '../Pagination';
import Select from '../../../Select';
import SelectItem from '../../../SelectItem';

const prefix = 'cds';

/**
 * For the given EnzymeWrapper, find the corresponding <select> element for
 * selecting a page in the Pagination
 * @param {EnzymeWrapper} wrapper
 * @returns {EnzymeWrapper}
 */
const getPageSelect = (wrapper) => {
  return wrapper.find(`.${prefix}--pagination__right .${prefix}--select-input`);
};

/**
 * Find the value of the <select> element used to select the current page
 * @param {EnzymeWrapper} wrapper
 * @returns {number}
 */
const getCurrentPage = (wrapper) => {
  return getPageSelect(wrapper).prop('value');
};

/**
 * Select a page from the <select> for choosing the current page
 * @param {EnzymeWrapper} wrapper
 * @param {pageNumber} pageNumber
 * @returns {void}
 */
const selectPage = (wrapper, pageNumber) => {
  getPageSelect(wrapper).simulate('change', {
    target: {
      value: pageNumber,
    },
  });
};

/**
 * Increment the current page by performing an action on the "Next page" button
 * @param {EnzymeWrapper} wrapper
 * @returns {void}
 */
const incrementPage = (wrapper) => {
  wrapper.find('button.cds--pagination__button--forward').simulate('click');
};

/**
 * Decrement the current page by performing an action on the "Previous page"
 * button
 * @param {EnzymeWrapper} wrapper
 * @returns {void}
 */
const decrementPage = (wrapper) => {
  wrapper.find('button.cds--pagination__button--backward').simulate('click');
};

/**
 * Find the <select> element responsible for choosing the page size for the
 * Pagination
 * @param {EnzymeWrapper} wrapper
 * @returns {EnzymeWrapper}
 */
const getPageSizeSelect = (wrapper) => {
  return wrapper.find(`.${prefix}--pagination__left .${prefix}--select-input`);
};

/**
 * Get the current value of the <select> element for page sizes
 * @param {EnzymeWrapper} wrapper
 * @returns {number}
 */
const getPageSize = (wrapper) => {
  return getPageSizeSelect(wrapper).prop('value');
};

/**
 * Select the page size from the <select> element for page sizes
 * @param {EnzymeWrapper} wrapper
 * @param {number} size
 * @returns {void}
 */
const selectPageSize = (wrapper, size) => {
  getPageSizeSelect(wrapper).simulate('change', {
    target: {
      value: size,
    },
  });
};

jest.useFakeTimers();

describe('Pagination', () => {
  let pagination;

  beforeEach(() => {
    pagination = mount(
      <Pagination className="extra-class" pageSizes={[5, 10]} totalItems={50} />
    );
  });

  it('should have 2 icons', () => {
    const iconTypes = [CaretLeft, CaretRight];
    const icons = pagination.findWhere((n) => iconTypes.includes(n.type()));
    expect(icons.length).toEqual(2);
  });

  describe('pagination container', () => {
    it('should render the expected classes', () => {
      expect(pagination.childAt(0).hasClass(`${prefix}--pagination`)).toBe(
        true
      );
      expect(pagination.childAt(0).hasClass('extra-class')).toBe(true);
    });
  });

  describe('pagination size container', () => {
    it('should render a left container', () => {
      const left = pagination.find(`.${prefix}--pagination__left`);
      expect(left.length).toBe(1);
    });

    it('should have a size dropdown', () => {
      const left = pagination.find(`.${prefix}--pagination__left`);
      const select = left.find(Select);
      const items = select.find(SelectItem);
      expect(select.length).toBe(1);
      expect(items.length).toBe(2);
      expect(items.at(0).props().value).toBe(5);
      expect(items.at(1).props().value).toBe(10);
    });

    it('should label the dropdown', () => {
      const left = pagination.find(`.${prefix}--pagination__left`);
      const label = left.find(`.${prefix}--pagination__text`).first();
      expect(label.text()).toBe('Items per page:');
    });

    it('should show the item range out of the total', () => {
      const left = pagination.find(`.${prefix}--pagination__left`);
      const label = left.find(`.${prefix}--pagination__text`).at(1);
      expect(label.text()).toBe('1–5 of 50 items');
    });

    describe('pagination size container when total pages unknown', () => {
      it('should render a left container', () => {
        const pager = mount(
          <Pagination pageSizes={[5, 10]} pagesUnknown={true} />
        );
        const left = pager.find(`.${prefix}--pagination__left`);
        expect(left.length).toBe(1);
      });

      it('should have a size dropdown', () => {
        const pager = mount(
          <Pagination pageSizes={[5, 10]} pagesUnknown={true} />
        );
        const left = pager.find(`.${prefix}--pagination__left`);
        const select = left.find(Select);
        const items = select.find(SelectItem);
        expect(select.length).toBe(1);
        expect(items.length).toBe(2);
        expect(items.at(0).props().value).toBe(5);
        expect(items.at(1).props().value).toBe(10);
      });

      it('should label the dropdown', () => {
        const pager = mount(
          <Pagination pageSizes={[5, 10]} pagesUnknown={true} />
        );
        const left = pager.find(`.${prefix}--pagination__left`);
        const label = left.find(`.${prefix}--pagination__text`).first();
        expect(label.text()).toBe('Items per page:');
      });

      it('should show the item range without the total', () => {
        const pager = mount(
          <Pagination pageSizes={[5, 10]} pagesUnknown={true} />
        );
        const left = pager.find(`.${prefix}--pagination__left`);
        const label = left.find(`.${prefix}--pagination__text`).at(1);
        expect(label.text()).toBe('1–5 items');
      });
    });

    describe('pagination sizing', () => {
      it('should respond to page size changes', () => {
        let actualPageSize;
        const handler = ({ pageSize }) => {
          actualPageSize = pageSize;
        };
        const pager = mount(
          <Pagination pageSizes={[5, 10]} totalItems={50} onChange={handler} />
        );
        expect(getPageSize(pager)).toBe(5);
        pager
          .find('select')
          .first()
          .simulate('change', { target: { value: 10 } });
        expect(actualPageSize).toBe(10);
        expect(getPageSize(pager)).toBe(10);

        // Text updates after change
        const labels = pager.find(`.${prefix}--pagination__text`);
        expect(labels.at(1).text()).toBe('1–10 of 50 items');
        expect(labels.at(2).text()).toBe('of 5 pages');
      });

      it('should reset the page when page size changes', () => {
        let actualPage;
        const handler = ({ page }) => {
          actualPage = page;
        };
        const pager = mount(
          <Pagination pageSizes={[5, 10]} totalItems={50} onChange={handler} />
        );

        incrementPage(pager);
        expect(getCurrentPage(pager)).toBe(2);
        pager
          .find('select')
          .first()
          .simulate('change', { target: { value: 10 } });
        expect(actualPage).toBe(1);
        expect(getCurrentPage(pager)).toBe(1);
      });

      it('should return to first page on changes to pageSizes', () => {
        const pager = mount(<Pagination pageSizes={[5, 10]} totalItems={50} />);
        incrementPage(pager);
        pager.setProps({ pageSizes: [3, 6] });
        expect(getCurrentPage(pager)).toBe(1);
      });

      it('should not return to first page on changes to pageSizes where current pageSize is in new list', () => {
        const pager = mount(
          <Pagination pageSizes={[5, 10]} pageSize={10} totalItems={50} />
        );
        selectPage(pager, 2);
        pager.setProps({ pageSizes: [5, 10, 20] });
        expect(getCurrentPage(pager)).toBe(2);
      });

      it('should return to first page on changes to pageSizes where current pageSize is not in new list', () => {
        const pager = mount(
          <Pagination pageSizes={[5, 10]} pageSize={10} totalItems={50} />
        );
        selectPage(pager, 2);
        pager.setProps({ pageSizes: [25, 50, 100] });
        expect(getCurrentPage(pager)).toBe(1);
      });

      it('should avoid returning to first page unless actual change in pageSizes is detected', () => {
        const pager = mount(<Pagination pageSizes={[5, 10]} totalItems={50} />);

        selectPage(pager, 2);
        pager.setProps({ pageSizes: [5, 10] });
        expect(getCurrentPage(pager)).toBe(2);
      });

      it('should default to pageSize if pageSize is provided', () => {
        const pager = mount(
          <Pagination pageSizes={[5, 10]} pageSize={10} totalItems={50} />
        );
        expect(getPageSize(pager)).toBe(10);
      });

      it('should default to pageSize if on change to pageSize', () => {
        const pager = mount(<Pagination pageSizes={[5, 10]} totalItems={50} />);
        pager.setProps({ pageSize: 10 });
        expect(getPageSize(pager)).toBe(10);
      });

      it('should avoid defaulting to pageSize unless actual change in pageSize is detected', () => {
        const pager = mount(
          <Pagination pageSizes={[5, 10, 20]} pageSize={10} totalItems={50} />
        );

        selectPageSize(pager, 20);
        pager.setProps({ pageSize: 10 });
        expect(getPageSize(pager)).toBe(20);
      });
    });
  });

  describe('pagination paging container', () => {
    it('should render a right container', () => {
      const right = pagination.find(`.${prefix}--pagination__right`);
      expect(right.length).toBe(1);
    });

    it('should show the current page out of the total number of pages', () => {
      const right = pagination.find(`.${prefix}--pagination__right`);
      const label = right.find(`.${prefix}--pagination__text`).first();
      expect(label.text()).toBe('of 10 pages');
    });

    it('should render ranges and pages for no items', () => {
      const pager = mount(<Pagination pageSizes={[5, 10]} totalItems={0} />);
      const labels = pager.find(`.${prefix}--pagination__text`);
      expect(labels.at(1).text()).toBe('0–0 of 0 items');
      expect(labels.at(2).text()).toBe('of 1 page');
    });

    it('should have two buttons for navigation', () => {
      const right = pagination.find(`.${prefix}--pagination__right`);
      const buttons = right.find(`.${prefix}--pagination__button`).hostNodes();
      expect(buttons.length).toBe(2);
      expect(
        buttons.at(0).hasClass(`${prefix}--pagination__button--backward`)
      ).toBe(true);
      expect(
        buttons.at(1).hasClass(`${prefix}--pagination__button--forward`)
      ).toBe(true);
    });

    it('should disable backward navigation for the first page', () => {
      const right = pagination.find(`.${prefix}--pagination__right`);
      const buttons = right.find(`.${prefix}--pagination__button`).hostNodes();
      expect(buttons.at(0).props().disabled).toBe(true);
      expect(buttons.at(1).props().disabled).toBe(false);
    });

    it('should disable forward navigation for the last page', () => {
      const smallPage = shallow(
        <Pagination className="extra-class" pageSizes={[100]} totalItems={50} />
      );
      const buttons = smallPage.find(`.${prefix}--pagination__button`);
      expect(buttons.at(0).props().disabled).toBe(true);
      expect(buttons.at(1).props().disabled).toBe(true);
    });

    describe('pagination paging container when total pages unknown', () => {
      it('should render a right container', () => {
        const pager = mount(
          <Pagination pageSizes={[5, 10]} pagesUnknown={true} />
        );

        const right = pager.find(`.${prefix}--pagination__right`);
        expect(right.length).toBe(1);
      });

      it('should show the current page without the total number of pages', () => {
        const pager = mount(
          <Pagination pageSizes={[5, 10]} pagesUnknown={true} />
        );

        const right = pager.find(`.${prefix}--pagination__right`);
        const label = right.find(`.${prefix}--pagination__text`).first();
        expect(label.text()).toBe('page 1');
      });

      it('should have two buttons for navigation', () => {
        const pager = mount(
          <Pagination pageSizes={[5, 10]} pagesUnknown={true} />
        );

        const right = pager.find(`.${prefix}--pagination__right`);
        const buttons = right
          .find(`.${prefix}--pagination__button`)
          .hostNodes();
        expect(buttons.length).toBe(2);
        expect(
          buttons.at(0).hasClass(`${prefix}--pagination__button--backward`)
        ).toBe(true);
        expect(
          buttons.at(1).hasClass(`${prefix}--pagination__button--forward`)
        ).toBe(true);
      });

      it('should disable backward navigation for the first page', () => {
        const pager = mount(
          <Pagination pageSizes={[5, 10]} pagesUnknown={true} />
        );

        const right = pager.find(`.${prefix}--pagination__right`);
        const buttons = right
          .find(`.${prefix}--pagination__button`)
          .hostNodes();
        expect(buttons.at(0).props().disabled).toBe(true);
        expect(buttons.at(1).props().disabled).toBe(false);
      });

      it('should disable forward navigation for the last page', () => {
        const smallPage = shallow(
          <Pagination pageSizes={[100]} pagesUnknown={true} isLastPage={true} />
        );
        const buttons = smallPage.find(`.${prefix}--pagination__button`);
        expect(buttons.at(0).props().disabled).toBe(true);
        expect(buttons.at(1).props().disabled).toBe(true);
      });

      it('should hide text input if disabled', () => {
        const noTextInput = shallow(
          <Pagination pageSizes={[100]} pagesUnknown={true} disabled={true} />
        );
        const right = noTextInput.find(
          `.${prefix}--pagination__right .${prefix}--text__input`
        );
        expect(right.length).toEqual(0);
      });

      it('should append `pagination__button--no-index` class if input is disabled', () => {
        const pagination = shallow(
          <Pagination
            page={2}
            pageSizes={[100]}
            pagesUnknown={true}
            disabled={true}
          />
        );
        const forwardButton = pagination.find(
          `.${prefix}--pagination__button--forward`
        );
        const backwardButton = pagination.find(
          `.${prefix}--pagination__button--backward`
        );
        expect(
          backwardButton.hasClass(`${prefix}--pagination__button--no-index`)
        ).toEqual(true);
        expect(
          forwardButton.hasClass(`${prefix}--pagination__button--no-index`)
        ).toEqual(true);
      });
    });

    describe('pagination navigation', () => {
      it('should go to the next page when clicking forward', () => {
        let actualPage;
        const handler = ({ page }) => {
          actualPage = page;
        };
        const pager = mount(
          <Pagination pageSizes={[5, 10]} totalItems={50} onChange={handler} />
        );
        expect(getCurrentPage(pager)).toBe(1);
        pager
          .find(`.${prefix}--pagination__button--forward`)
          .hostNodes()
          .simulate('click');
        expect(actualPage).toBe(2);
        expect(getCurrentPage(pager)).toBe(2);
      });

      it('should go to the previous page when clicking backward', () => {
        let actualPage;
        const handler = ({ page }) => {
          actualPage = page;
        };
        const pager = mount(
          <Pagination pageSizes={[5, 10]} totalItems={50} onChange={handler} />
        );
        incrementPage(pager);
        expect(getCurrentPage(pager)).toBe(2);
        pager
          .find(`.${prefix}--pagination__button--backward`)
          .hostNodes()
          .simulate('click');
        expect(actualPage).toBe(1);
        expect(getCurrentPage(pager)).toBe(1);
      });

      it('should jump to the page entered in the input field', () => {
        let actualPage;
        const handler = ({ page }) => {
          actualPage = page;
        };
        const pager = mount(
          <Pagination pageSizes={[5, 10]} totalItems={50} onChange={handler} />
        );
        expect(getCurrentPage(pager)).toBe(1);
        pager
          .find('select')
          .last()
          .simulate('change', { target: { value: 2 } });
        jest.runAllTimers();
        expect(actualPage).toBe(2);
        expect(getCurrentPage(pager)).toBe(2);
      });

      it('should jump to page number if prop page is provided', () => {
        const pager = mount(
          <Pagination pageSizes={[5, 10]} totalItems={50} page={3} />
        );
        expect(getCurrentPage(pager)).toBe(3);
        pager.setProps({ page: 2 });
        expect(getCurrentPage(pager)).toBe(2);
      });

      it('should avoid jumping to page number unless actual change in prop page is detected', () => {
        const pager = mount(
          <Pagination pageSizes={[5, 10]} totalItems={50} page={3} />
        );

        expect(getCurrentPage(pager)).toBe(3);
        decrementPage(pager);
        pager.setProps({ page: 3 });
        expect(getCurrentPage(pager)).toBe(2);
      });

      it('should not increment page if there is only 1 page', () => {
        const pager = mount(<Pagination pageSizes={[10]} totalItems={5} />);
        const buttons = pager.find(`.${prefix}--pagination__button`);
        expect(buttons.at(1).props().disabled).toBe(true);
      });
    });
  });

  it('should render with ref', () => {
    const ref = React.createRef();
    mount(<Pagination pageSizes={[10]} totalItems={5} ref={ref} />);

    expect(ref.current).toHaveClass(`${prefix}--pagination`);
  });
});
