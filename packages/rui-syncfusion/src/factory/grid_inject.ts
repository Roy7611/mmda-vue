import {
  DetailRow as GridDetailRow,
  Edit as GridEdit,
  Filter as GridFilter,
  Grid,
  Group,
  Page,
  Pager,
  PagerDropDown,
  Resize as GridResize,
  Selection,
  Sort as GridSort,
} from "@syncfusion/ej2-react-grids";

Grid.Inject(
  GridSort,
  GridFilter,
  Group,
  Selection,
  GridResize,
  GridEdit,
  GridDetailRow,
);

Pager.Inject(Page, PagerDropDown);
