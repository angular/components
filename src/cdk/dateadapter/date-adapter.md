CDK DateAdapter component gives a foundation for more concrete material DateAdapter implementations.

### Usages of CDK DateAdapter
The base CDK version of the DateAdapter primarily manages the date functionality of the datepicker. In the CDK, there
already exists an extended version of the DateAdapter: `NativeDateAdapter`. Currently in material, there's also another
way to use the DateAdapter: `MomentDateAdapter`. The user also has the choice of creating their own DateAdapter that
will be used in the datepicker, if they wish to do so.

### Behavior captured by Cdk DateAdapter
The CDK DateAdapter is an abstract class that allows users to implement their own DateAdapter as well as use existing
DateAdapters. The functions of the DateAdapter include anything to do with date (month, year, day) implementations of a
generic dates. Users can use the CDK DateAdapter by extending it and implementing the necessary abstract methods. The
DateAdapter also has functionality to format or deserialize dates, as well as other useful date manipulation methods.