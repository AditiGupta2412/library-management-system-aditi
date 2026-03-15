const Issue = require('../models/Issue');
const Book = require('../models/Book');


exports.issueBook = async (req, res) => {
  try {
    const { serialNo, membershipId, issueId, bookName, author, returnDate } = req.body;

    const existingIssue = await Issue.findOne({ issueId });
    if (existingIssue) {
      return res.status(400).json({ message: 'Issue ID already exists' });
    }

    const book = await Book.findOneAndUpdate(
      { serialNo },
      { status: 'Issued' },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const issue = new Issue({
      issueId,
      serialNo,
      membershipId,
      bookName,
      author,
      returnDate,
      status: 'Active',
    });

    await issue.save();
    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.returnBook = async (req, res) => {
  try {
    const { issueId } = req.body;
    const actualReturnDate = new Date();

    const issue = await Issue.findOne({ issueId });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }


    let fine = 0;
    if (actualReturnDate > new Date(issue.returnDate)) {
      const daysOverdue = Math.ceil((actualReturnDate - new Date(issue.returnDate)) / (1000 * 60 * 60 * 24));
      fine = daysOverdue * 10;
    }

    issue.actualReturnDate = actualReturnDate;
    issue.fine = fine;
    issue.status = fine > 0 ? 'Overdue' : 'Returned';

    await issue.save();


    if (fine === 0) {
      await Book.findOneAndUpdate(
        { serialNo: issue.serialNo },
        { status: 'Available' }
      );
    }

    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.payFine = async (req, res) => {
  try {
    const { issueId } = req.body;

    const issue = await Issue.findOne({ issueId });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.finePaid = true;
    issue.status = 'Returned';

    await issue.save();


    await Book.findOneAndUpdate(
      { serialNo: issue.serialNo },
      { status: 'Available' }
    );

    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getIssues = async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getActiveIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ status: 'Active' });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getOverdueIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ status: 'Overdue' });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
